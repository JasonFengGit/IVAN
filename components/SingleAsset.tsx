import { useAllReserveData } from "./navi/hooks/useContract"
import SingleAssetBlock from "./navi/SingleAssetBlock"


interface SingleAssetProps {
  coin: string;
}

function SingleAssetComp({ coin }: SingleAssetProps) {
  const {data: allReserveData,run: runGetAllReserveData, runAsync:runAsyncGetAllReserveData} = useAllReserveData()

  return (
    <SingleAssetBlock allReserveData={allReserveData} coinName={coin}/>
  )
}

export function SingleAsset({ coin }: SingleAssetProps) {
    return(
      <SingleAssetComp coin={coin}></SingleAssetComp>
)
}