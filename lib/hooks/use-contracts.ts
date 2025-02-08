import { Transaction } from '@mysten/sui/transactions'
import { BCS, getSuiMoveConfig } from '@mysten/bcs'
import { useRequest } from 'ahooks'
import { BigNumber } from 'bignumber.js'
import { useDispatch, useSelector } from 'react-redux'
import { hide, show } from '@ebay/nice-modal-react'
import { useRouter } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { useCallback, useEffect } from 'react'
import { bcs as bsc } from '@mysten/sui/bcs'
import { toast } from 'react-toastify'
import { useProvider } from './useProvider'
import { useGlobalData } from './useGlobaldata'
import {
  ActionType,
  CoinPoolType,
  Default_Decimals,
  DEFAULT_REWARD_APY_ADDRESS,
  DynamicHealthDisableType,
  OptionType,
  BORROW_FEE_ADDRESS,
} from '@/utils/constants'
import {
  calcPercent,
  calculatePrice,
  formWei,
  fromRateWei,
  rayMathMulIndex,
  formatDecimalPlaces,
  isValueGtZero,
  getIncentiveApyInfo,
  fromRate,
} from '@/utils'
import store, { RootState } from '@/store'
import { useDashboardContext } from '@/contexts/dashboardContext'
import SuccessOrFailDialog from '@/navicomponents/SuccessOrFailDialog'
import { Supply_Module_Status, Borrow_Module_Status } from '@/define'
import { deParse, formatSuiAddress, getObjectFields, isSuiAddress } from '@/sui/action'
import { CoinMetaDatas, FundsPoolInfo } from '@/sui/config'
import { SupplyRewardDialog } from '@/navicomponents/SupplyRewardDialog'
import { BorrowRewardDialog } from '@/navicomponents/BorrowRewardDialog'
import { inviteBindCode } from '@/api/invite'
import { useNetWork, useSignAndExecuteTransactionBlock } from '@/sui/hook'
import { updatePrice } from '@/services/oracle'
import { Strategy, tokens } from '@/services/strategy/config'
import events from '@/services/events'
import { isAllowOptCoinThrows } from '@/services/blacklist'
import { Upgrade_Dialog_Key } from '@/navicomponents/UpgradeDialog'
import { confirmDialog, BorrowTip } from '@/navicomponents/common/ConfirmDialog'
import i18n from '@/services/i18n'
import { getBorrowFee } from '@/services/fee'
import { ActivityType, isActivityActive } from '@/services/activities'
import AppConfig from '@/config/app'
import { UserPortfolio } from '@/services/lending'
import store2 from 'store2'


const NEXT_PUBLIC_LENDING_CORE_STORAGE_OBJECT_ID = process.env.NEXT_PUBLIC_LENDING_CORE_STORAGE_OBJECT_ID as string
const NEXT_PUBLIC_LENDING_CORE_INCENTIVE_OBJECT_ID = process.env.NEXT_PUBLIC_LENDING_CORE_INCENTIVE_OBJECT_ID as string
const NEXT_PUBLIC_LENDING_CORE_INCENTIVE_V2_OBJECT_ID = process.env
  .NEXT_PUBLIC_LENDING_CORE_INCENTIVE_V2_OBJECT_ID as string
const NEXT_PUBLIC_PRICE_ORACLE_OBJECT_ID = process.env.NEXT_PUBLIC_PRICE_ORACLE_OBJECT_ID as string


export const useDeposit = (coinInfo, onRefresh, onReset, referralCode?: string) => {
  const signAndExecuteTransactionBlock = useSignAndExecuteTransactionBlock()
  const { getCoinsData } = useGetCoinsMerge()
  const { run: bindCodeRun } = useInviteBindCode()
  const { address } = useNetWork()
  const { data: allReserveData } = useAllReserveData()
  const { data: provider } = useProvider()
  return useRequest(
    async (amount: number) => {
      if (!address) {
        throw new Error('wallet not connected')
      }
      const userBorrowTokenList = allReserveData?.filter((item: any) => {
        return new BigNumber(item.borrowAmount)
          .div(Math.pow(10, Default_Decimals))
          .gt([8, 3].includes(item.id) ? 0.0000001 : 0.01)
      })

      const hasBorrow = !!userBorrowTokenList?.find((item) => {
        return item.id === coinInfo.id
      })
      if (hasBorrow) {
        const confirmed = await confirmDialog(BorrowTip)
        if (!confirmed) {
          return false
        }
      }
      const tx = new Transaction()
      if (process.env.NEXT_PUBLIC_ENABLE_ORACLE_UPDATE_MODE === 'loose') {
        await updatePrice(provider as any, address, tx)
      }
      const isSUI = isSuiAddress(coinInfo?.coinType)
      let coinObjectId = ''
      if (!isSUI) {
        coinObjectId = (await getCoinsData(coinInfo?.coinType, tx))?.[0]?.coinObjectId
      }
      
      isAllowOptCoinThrows(address, 'deposit', coinInfo.coinMetaData.symbol)
      tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_LENDING_CORE_PACKAGE}::incentive_v2::entry_deposit`,
        typeArguments: [coinInfo?.coinType],
        arguments: [
          tx.object('0x06'), // clock
          tx.object(NEXT_PUBLIC_LENDING_CORE_STORAGE_OBJECT_ID), // storage
          tx.object(CoinPoolType[coinInfo?.coinType] as string), // poolid
          tx.pure.u8(coinInfo?.id), // asset
          isSUI ? tx.splitCoins(tx.gas, [tx.pure.u64(amount)]) : tx.object(coinObjectId), // deposit_coin
          tx.pure.u64(amount), // amount
          tx.object(NEXT_PUBLIC_LENDING_CORE_INCENTIVE_OBJECT_ID),
          tx.object(NEXT_PUBLIC_LENDING_CORE_INCENTIVE_V2_OBJECT_ID), // incentive
        ],
      })
      return signAndExecuteTransactionBlock(
        tx,
        {},
        {
          scene: 'deposit',
        },
      )
    },
    {
      onSuccess: (response: any, params: any) => {
        if (response === false) {
          return
        }
        if (response?.effects?.status?.status === 'success') {
          console.log("calling refresh")
          onRefresh?.()
          onReset?.()
          show(SuccessOrFailDialog, {
            type: 'success',
            title: i18n.t('dialog:transaction.success-title'),
            text: i18n.t('dialog:transaction.supplied-result', {
              amount: `${formatDecimalPlaces(
                params[0],
                coinInfo?.coinMetaData?.decimals,
                -1 * coinInfo?.coinMetaData?.decimals,
              ).toString(10)} ${coinInfo?.coinName}`,
            }),
            digest: response?.digest,
            response,
            btnText: i18n.t('dialog:transaction.ok'),
            onOK: () => {
              onRefresh?.()
            },
          })
          if (referralCode) {
            bindCodeRun(String(referralCode), response?.digest)
          }
        } else {
          
          show(SuccessOrFailDialog, {
            type: 'fail',
            title: i18n.t('dialog:transaction.fail-title'),
            text: i18n.t('dialog:transaction.report-to-us'),
            digest: response?.digest,
            btnText: i18n.t('dialog:transaction.ok'),
            response,
          })
        }
      },
      onError: (error) => {
        console.error(error)
        toast.error(error.message)
        
        throw new Error(error.toString())
      },
      manual: true,
      ready: !!coinInfo && !!provider,
    },
  )
}

export const useBorrow = (coinInfo, onRefresh, onReset) => {
  const signAndExecuteTransactionBlock = useSignAndExecuteTransactionBlock()
  const { address } = useNetWork()
  const { data: provider } = useProvider()
  const { data: allReserveData } = useAllReserveData()
  const activityActive = isActivityActive(ActivityType.BorrowFeeRemission)

  return useRequest(
    async (amount: number) => {
      if (!address) {
        throw new Error('wallet not connected')
      }
      const userSupplyTokenList = allReserveData?.filter((item: any) => {
        return new BigNumber(item.supplyAmount)
          .div(Math.pow(10, Default_Decimals))
          .gt([8, 3].includes(item.id) ? 0.0000001 : 0.01)
      })

      const hasSupply = !!userSupplyTokenList?.find((item) => {
        return item.id === coinInfo.id
      })
      if (hasSupply) {
        const confirmed = await confirmDialog(BorrowTip)
        if (!confirmed) {
          return false
        }
      }

      const fee = getBorrowFee(coinInfo?.coinName)

      const feeAmount = Math.floor(new BigNumber(amount).multipliedBy(fee).toNumber())
      amount = new BigNumber(amount).plus(feeAmount).toNumber()

      console.debug('contract borrow total amount', amount.toString())

      
      isAllowOptCoinThrows(address, 'borrow', coinInfo.coinMetaData.symbol)
      const tx = new Transaction()
      await updatePrice(provider as any, address, tx)
      const borrowBalance = tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_LENDING_CORE_PACKAGE}::incentive_v2::borrow`,
        typeArguments: [coinInfo?.coinType],
        arguments: [
          tx.object('0x06'),
          tx.object(NEXT_PUBLIC_PRICE_ORACLE_OBJECT_ID),
          tx.object(NEXT_PUBLIC_LENDING_CORE_STORAGE_OBJECT_ID),
          tx.object(CoinPoolType[coinInfo?.coinType] as string),
          tx.pure.u8(coinInfo?.id),
          tx.pure.u64(amount),
          tx.object(NEXT_PUBLIC_LENDING_CORE_INCENTIVE_V2_OBJECT_ID),
        ],
      })
      const [borrowCoin] = tx.moveCall({
        target: `0x02::coin::from_balance`,
        typeArguments: [coinInfo?.coinType],
        arguments: [borrowBalance],
      })

      const [borrowFeeCoin] = tx.splitCoins(borrowCoin, [tx.pure.u64(feeAmount)])
      tx.transferObjects([borrowCoin], tx.pure.address(address))
      tx.transferObjects([borrowFeeCoin], tx.pure.address(BORROW_FEE_ADDRESS))
      return signAndExecuteTransactionBlock(
        tx,
        {},
        {
          scene: 'borrow',
          data: {
            feeAmount,
            amount,
          },
        },
      )
    },
    {
      onSuccess: (response: any, params: any) => {
        if (response === false) {
          return
        }
        if (response?.effects?.status?.status === 'success') {
          const { feeAmount, amount } = response?.metaData
          
          onReset?.()
          show(SuccessOrFailDialog, {
            type: 'success',
            title: i18n.t('dialog:transaction.success-title'),
            text: i18n.t('dialog:transaction.borrow-result', {
              amount: `${formatDecimalPlaces(
                amount - feeAmount,
                coinInfo?.coinMetaData?.decimals,
                -1 * coinInfo?.coinMetaData?.decimals,
              ).toString(10)} ${coinInfo?.coinName}`,
            }),
            digest: response?.digest,
            btnText: i18n.t('dialog:transaction.ok'),
            onOK: () => {
              onRefresh?.()
            },
            response,
          })
        } else {
          
          show(SuccessOrFailDialog, {
            type: 'fail',
            title: i18n.t('dialog:transaction.fail-title'),
            text: i18n.t('dialog:transaction.report-to-us'),
            digest: response?.digest,
            btnText: i18n.t('dialog:transaction.ok'),
            response,
          })
        }
      },
      onError: (error) => {
        toast.error(error.message)
        console.log(error)
      },
      manual: true,
      ready: !!coinInfo && !!address,
    },
  )
}

export const useGetWalletBalance = () => {
  const { data: provider } = useProvider()
  const { address } = useNetWork()

  const rtn = useRequest(
    async () => {
      const result = provider?.getAllBalances({
        owner: address!,
      })
      return result
    },
    {
      ready: !!provider && !!address,
      refreshDeps: [address],
      cacheKey: 'useGetWalletBalance',
      pollingInterval: 1000,
      pollingWhenHidden: false,
    },
  )

  useEffect(() => {
    events.on('executeStrategySuccess', rtn.runAsync)
    return () => {
      events.off('executeStrategySuccess', rtn.runAsync)
    }
  }, [rtn.runAsync])

  return rtn
}

export const useGetReserveData = (options?: { pollingInterval?: number; pollingWhenHidden?: boolean }) => {
  const { address } = useNetWork()
  const { data: provider } = useProvider()
  const { data: storageData } = useGetStorage()
  return useRequest(
    async () => {
      if (!storageData) return
      Sentry.setTags({
        // rpc: provider?.connection?.fullnode,
        address: address,
      })
      const paused = getObjectFields(storageData)?.paused
      if (paused) {
        show(Upgrade_Dialog_Key)
      }
      const parentId = getObjectFields(storageData)?.reserves?.fields?.id?.id
      const reservesCount = getObjectFields(storageData)?.reserves_count
      const reserversList = Array.from({ length: reservesCount }, (_, index) => index)
      const resArr = reserversList.map((item) => {
        return provider?.getDynamicFieldObject({ parentId: parentId, name: { type: 'u8', value: item } })
      })
      const allReserveList = await Promise.all(resArr)
      const multiUserSupplyCall = allReserveList?.map((item) => {
        if (!address) return
        return provider?.getDynamicFieldObject({
          parentId: getObjectFields(item)?.value?.fields?.supply_balance?.fields?.user_state?.fields?.id?.id,
          name: { type: 'address', value: address },
        })
      })
      const userSupplyData = address ? await Promise.all(multiUserSupplyCall) : []

      const multiUserBorrowCall = allReserveList?.map((item) => {
        if (!address) return
        return provider?.getDynamicFieldObject({
          parentId: getObjectFields(item)?.value?.fields?.borrow_balance?.fields?.user_state?.fields?.id?.id,
          name: { type: 'address', value: address || '' },
        })
      })
      const userBorrowData = address ? await Promise.all(multiUserBorrowCall) : []
      const result = allReserveList?.map((item, index) => {
        const supplyAmountSource = address ? getObjectFields(userSupplyData[index])?.value : '0'
        const supplyAmount = address
          ? rayMathMulIndex(
              getObjectFields(userSupplyData[index])?.value,
              getObjectFields(item)?.value?.fields?.current_supply_index,
            ).toString()
          : '0'
        const borrowAmountSource = address ? getObjectFields(userBorrowData[index])?.value : '0'
        const borrowAmount = address
          ? rayMathMulIndex(
              getObjectFields(userBorrowData[index])?.value,
              getObjectFields(item)?.value?.fields?.current_borrow_index,
            ).toString()
          : '0'

        return {
          ...getObjectFields(item)?.value?.fields,
          supply_cap_ceiling: new BigNumber(getObjectFields(item)?.value?.fields?.supply_cap_ceiling)
            .shiftedBy(-1 * Default_Decimals)
            .toString(),
          supplyAmountSource,
          supplyAmount,
          borrowAmountSource,
          borrowAmount,
        }
      })
      return result
    },
    {
      ready: !!provider && !!storageData,
      refreshDeps: [address],
      cacheKey: 'useGetReserveData',
      pollingInterval: 1000,
      pollingWhenHidden: options?.pollingWhenHidden
    },
  )
}

export const useAllReserveData = () => {
  const { address } = useNetWork()
  const { data: provider } = useProvider()
  const { token } = useSelector((state: RootState) => state.token)
  const { data: reserveList, refreshAsync: refreshReserveData } = useGetReserveData()
  const { data: walletBalanceData, refreshAsync: refreshWalletBalance } = useGetWalletBalance()
  const { setAllReserveData, loadinged, setLoadinged } = useDashboardContext()
  //console.log(reserveList)
  const rtn = useRequest(
    async () => {
      //console.log("RTNNNN")
      const mergeResult = reserveList
        ?.map((item) => {
          const metaData = CoinMetaDatas[formatSuiAddress(item.coin_type)]
          const coinBalance = walletBalanceData?.filter(
            (v) => formatSuiAddress(v?.coinType) === formatSuiAddress(item?.coin_type),
          )?.[0]?.totalBalance
          const totalSupplyAmount = rayMathMulIndex(
            item?.supply_balance?.fields?.total_supply,
            item?.current_supply_index,
          )
          const leftSupply = new BigNumber(fromRateWei(item?.supply_cap_ceiling)).minus(
            new BigNumber(formWei(totalSupplyAmount, Default_Decimals)),
          )
          const minimumAmount = new BigNumber(fromRateWei(item?.supply_cap_ceiling)).multipliedBy(0.1)
          const validBorrowAmount = new BigNumber(totalSupplyAmount).multipliedBy(fromRateWei(item?.borrow_cap_ceiling))

          const leftBorrowAmount = validBorrowAmount.minus(
            rayMathMulIndex(
              formWei(item?.borrow_balance?.fields?.total_supply, Default_Decimals),
              item?.current_borrow_index,
            ),
          )
          const borrowedAmount = rayMathMulIndex(item?.borrow_balance?.fields?.total_supply, item?.current_borrow_index)
          const tempAvailableAmount = validBorrowAmount.minus(borrowedAmount)

          const availableAmount = tempAvailableAmount.toNumber() > 0 ? tempAvailableAmount : new BigNumber(0)
          return {
            ...item,
            coinType: formatSuiAddress(item.coin_type),
            coinName: metaData?.symbol,
            coinMetaData: metaData,
            walletBalance: address && coinBalance ? coinBalance : 0,
            totalSupplyAmount: totalSupplyAmount.toString(),
            totalValueLocked: calculatePrice(totalSupplyAmount, token?.[item?.oracle_id]?.price, Default_Decimals),
            price:
              address && token && walletBalanceData
                ? calculatePrice(coinBalance || '', token?.[item?.oracle_id]?.price, metaData?.decimals)
                : 0,
            coinPrice: token?.[item?.oracle_id]?.price,
            minimumAmount,
            leftSupply,
            validBorrowAmount,
            borrowedAmount: borrowedAmount.toString(),
            leftBorrowAmount,
            supplyPrice: token
              ? calculatePrice(item?.supplyAmount, token?.[item?.oracle_id]?.price, Default_Decimals)
              : 0,
            supplyPriceSource: token
              ? calculatePrice(item?.supplyAmountSource, token?.[item?.oracle_id]?.price, Default_Decimals)
              : new BigNumber(0),
            availableBorrow: availableAmount.toString(),
            availableBorrowPrice: token
              ? calculatePrice(availableAmount, token?.[item?.oracle_id]?.price, Default_Decimals).toString()
              : 0,
            borrowPrice: token
              ? calculatePrice(item?.borrowAmount, token?.[item?.oracle_id]?.price, Default_Decimals)
              : new BigNumber(0),
            borrowPriceSource: token
              ? calculatePrice(item?.borrowAmountSource, token?.[item?.oracle_id]?.price, Default_Decimals)
              : 0,
          }
        })
        .filter((item) => {
          const startAt = AppConfig.poolConfig[item.coinType]?.startAt
          if (startAt && new Date(startAt) >= new Date()) {
            return false
          }
          return !!item.coinName
        })

      if (!loadinged) {
        setLoadinged(true)
      }
      setAllReserveData(mergeResult)
      
      store.dispatch({
        type: 'global/setReserveData',
        payload: JSON.parse(JSON.stringify(mergeResult)),
      })
      return mergeResult
    },
    {
      ready: !!provider && !!token && !!reserveList,
      refreshDeps: [token, reserveList, walletBalanceData],
      pollingInterval: 1000,
      cacheKey: 'useAllReserveData',
    },
  )

  const onRefresh = useCallback(() => {
    refreshReserveData()
    refreshWalletBalance()
  }, [refreshReserveData, refreshWalletBalance])

  rtn.refresh = onRefresh
  return rtn
}

export const useAssetsBorrow = () => {
  const { address } = useNetWork()
  const { data: allReserveData } = useAllReserveData()
  const { setBorrowModuleStatus, borrowModuleStatus, setCoinInfo, coinInfo } = useDashboardContext()
  return useRequest(
    async () => {
      // const tempSortList = allReserveData?.sort((a, b) =>
      //   new BigNumber(b?.current_borrow_rate).minus(a?.current_borrow_rate).toNumber(),
      // )
      const tempSortList = allReserveData?.sort((a, b) =>
        new BigNumber(b?.availableBorrowPrice).minus(a?.availableBorrowPrice).toNumber(),
      )

      const isGtZero = tempSortList?.some((item) =>
        // isBalanceGtZero(item.supplyAmount, item.coinName, item.coinMetaData.decimals),
        isValueGtZero(item.supplyAmount, item.coinMetaData.decimals),
      )
      let borrowStatus: Borrow_Module_Status

      if (!coinInfo) {
        setCoinInfo(tempSortList?.[0])
        setBorrowModuleStatus(isGtZero ? Borrow_Module_Status.Borrow : Borrow_Module_Status.NoBorrow)
      } else {
        setCoinInfo(allReserveData?.filter((item) => item?.id === coinInfo?.id)?.[0])
        if (isGtZero && borrowModuleStatus === Borrow_Module_Status.Repay) {
          borrowStatus = Borrow_Module_Status.Repay
        } else if (!isGtZero || !address) {
          borrowStatus = Borrow_Module_Status.NoBorrow
        } else {
          borrowStatus = Borrow_Module_Status.Borrow
        }
        setBorrowModuleStatus(borrowStatus)
      }
      return tempSortList
    },
    {
      ready: !!allReserveData,
      refreshDeps: [address, allReserveData],
      cacheKey: 'useAssetsBorrow',
    },
  )
}

export const useMarketInfo = () => {
  const { data: allReserveData } = useAllReserveData()
  const { setMarketInfo } = useDashboardContext()
  const { token } = useSelector((state: RootState) => state.token)
  const { data: incentiveApyData } = useGetIncentiveApy(OptionType.Supply)
  const { data: incentiveBorrowApyData } = useGetIncentiveApy(OptionType.Borrow)
  const globalData = useGlobalData()
  return useRequest(
    async () => {
      let walletSupplyPrice = new BigNumber(0)
      let totalSuppliedPrice = new BigNumber(0)
      let totalSuppliedPriceSource = new BigNumber(0)
      let collateralPrice = new BigNumber(0)
      allReserveData?.map((item) => {
        walletSupplyPrice = walletSupplyPrice.plus(
          calculatePrice(item?.walletBalance, token[item?.oracle_id]?.price, item?.coinMetaData?.decimals),
        )
        totalSuppliedPrice = totalSuppliedPrice.plus(item?.supplyPrice)
        totalSuppliedPriceSource = totalSuppliedPriceSource.plus(item?.supplyPriceSource)
        collateralPrice = new BigNumber(collateralPrice).plus(
          new BigNumber(
            calculatePrice(item?.supplyAmount, token[item?.oracle_id]?.price, Default_Decimals).multipliedBy(
              fromRateWei(item?.ltv),
            ),
          ),
        )
      })
      const validTotalSupplyPrice = walletSupplyPrice.plus(totalSuppliedPrice)
      const inSupplyPercent = calcPercent(totalSuppliedPrice, validTotalSupplyPrice)
      let totalsupplyApy = new BigNumber(0)
      let totalLtv = new BigNumber(0)
      let currentThreshold = new BigNumber(0)
      allReserveData?.map((item) => {
        const { apy } = getIncentiveApyInfo(item, incentiveApyData, globalData, true) || {}
        totalsupplyApy =
          totalSuppliedPrice?.toNumber() !== 0
            ? totalsupplyApy.plus(
                new BigNumber(item?.supplyPrice)
                  .dividedBy(totalSuppliedPrice)
                  .multipliedBy(apy ? new BigNumber(apy).dividedBy(100) : fromRateWei(item?.current_supply_rate)),
              )
            : new BigNumber(0)
        totalLtv =
          totalSuppliedPrice?.toNumber() !== 0
            ? totalLtv.plus(
                new BigNumber(item?.supplyPrice).dividedBy(totalSuppliedPrice).multipliedBy(fromRateWei(item?.ltv)),
              )
            : new BigNumber(0)

        currentThreshold =
          totalSuppliedPrice?.toNumber() !== 0
            ? currentThreshold.plus(
                new BigNumber(item?.supplyPrice || 0)
                  .dividedBy(totalSuppliedPrice || 0)
                  .multipliedBy(fromRateWei(item?.liquidation_factors?.fields?.threshold || 0) || 0),
              )
            : new BigNumber(0)
      })

      let totalValidBorrowPrice = new BigNumber(0)
      let totalBorrowedPrice = new BigNumber(0)
      let totalBorrowedPriceSource = new BigNumber(0)
      allReserveData?.map((item) => {
        const availableBorrowAmount = new BigNumber(item?.supply_balance?.fields?.total_supply)
          .multipliedBy(fromRateWei(item?.borrow_cap_ceiling))
          .minus(new BigNumber(item?.borrow_balance?.fields?.total_supply))

        totalValidBorrowPrice = totalValidBorrowPrice.plus(
          calculatePrice(availableBorrowAmount, token?.[item?.oracle_id]?.price, Default_Decimals),
        )
        totalBorrowedPrice = totalBorrowedPrice.plus(item?.borrowPrice)
        totalBorrowedPriceSource = totalBorrowedPriceSource.plus(item?.borrowPriceSource)
      })
      const inBorrowedPercent = calcPercent(totalBorrowedPrice, collateralPrice)
      let totalBorrowApy = new BigNumber(0)
      allReserveData?.map((item) => {
        const { vaultApr, boostedApr, voloApy } =
          getIncentiveApyInfo(item, incentiveBorrowApyData, globalData, false) || {}
        if (boostedApr) {
          const totalApy = new BigNumber(vaultApr || 0)
            .minus(boostedApr || 0)
            .minus(voloApy || 0)
            .div(100)
          const apy = new BigNumber(item?.borrowPrice).dividedBy(totalBorrowedPrice).multipliedBy(totalApy)
          totalBorrowApy = totalBorrowedPrice?.toNumber() !== 0 ? totalBorrowApy.plus(apy) : new BigNumber(0)
        } else {
          const apy = new BigNumber(item?.borrowPrice)
            .dividedBy(totalBorrowedPrice)
            .multipliedBy(BigNumber(fromRate(item?.current_borrow_rate, 3)).div(100))
          totalBorrowApy = totalBorrowedPrice?.toNumber() !== 0 ? totalBorrowApy.plus(apy) : new BigNumber(0)
        }
      })

      const netWorth = validTotalSupplyPrice.minus(totalBorrowedPrice)
      const munisApy = totalSuppliedPriceSource.eq(0)
        ? new BigNumber(0)
        : totalSuppliedPrice
            .multipliedBy(totalsupplyApy)
            .minus(totalBorrowedPrice.multipliedBy(totalBorrowApy))
            .div(totalSuppliedPrice)
      const hasLoan = allReserveData?.some((item) =>
        formatDecimalPlaces(item?.borrowAmount, item?.coinMetaData?.decimals, -1 * Default_Decimals).gt(0),
      )
      const marketInfo = {
        inSupplyPercent,
        totalSuppliedPrice,
        validTotalSupplyPrice,
        totalsupplyApy,
        inBorrowedPercent,
        totalBorrowedPrice,
        totalValidBorrowPrice,
        totalBorrowApy,
        netWorth,
        munisApy,
        totalLtv,
        currentThreshold,
        collateralPrice: collateralPrice.toString(),
        hasLoan,
      }
      //console.log("marketInfo", totalSuppliedPrice)
      setMarketInfo(marketInfo)
      return marketInfo
    },
    {
      ready: !!token && !!allReserveData,
      pollingInterval: 1000,
      refreshDeps: [token, allReserveData, globalData, incentiveBorrowApyData, incentiveApyData],
    },
  )
}
