import { DashboardProvider } from "./navi/contexts/dashboardContext"
import { Portfolio as NaviPortfolio } from "./navi/Portfolio"

function PortfolioComp() {
  return (
    <NaviPortfolio/>
  )
}

export function Portfolio() {
    return(
      <PortfolioComp ></PortfolioComp>
)
}