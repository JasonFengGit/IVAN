import { useAllReserveData } from "./navi/hooks/useContract"
import MarketBlock from "./navi/MarketBlock"

function MarketComp() {
  const {data: allReserveData,run: runGetAllReserveData, runAsync:runAsyncGetAllReserveData} = useAllReserveData()

  return (
    <MarketBlock allReserveData={allReserveData}/>
  )
}

export function Market() {
    return(
      <MarketComp ></MarketComp>
)
}