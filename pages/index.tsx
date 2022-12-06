import { GetServerSideProps, GetServerSidePropsContext } from "next"
import dynamic from "next/dynamic"
import Head from "next/head"
import Image from "next/image"
import { useCallback, useMemo } from "react"
import FileDropzone from "../components/FileDropzone"
import styles from "../styles/Home.module.scss"
import { useCategories, useConditions, useItemSales } from "../hooks/queries"
import { withCSR } from "../utils/withCSR"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { get } from "../utils"

const BarRechartWithoutSSR = dynamic(import("../components/BarRechart"), { ssr: false })
const PieRechartWithoutSSR = dynamic(import("../components/PieRechart"), { ssr: false })

const Home = () => {
  const totalSalesPerDay = useItemSales(
    {
      groupBy: "date",
      orderBy: "date",
      sum: "preTaxAmount",
    },
    { queryKey: ["itemSalesDailyTotals"] },
  )
  const totalSalesByCategory = useCategories(
    {},
    { queryKey: ["categoriesTotalSales"], queryFn: () => get({ route: "/categories/totalSales" }) },
  )
  const totalSalesByCondition = useConditions(
    {},
    { queryKey: ["conditionsTotalSales"], queryFn: () => get({ route: "/conditions/totalSales" }) },
  )

  const totalSalesPerDayData = useMemo(
    () =>
      totalSalesPerDay.data?.data.map((row) => {
        row.date = new Date(row.date).toLocaleDateString("en-US")
        return row
      }),
    [totalSalesPerDay.data],
  )

  const totalSalesByCategoryData = useMemo(
    () =>
      totalSalesByCategory.data?.data.map((row) => {
        if (row._sum.preTaxAmount) {
          row._sum.preTaxAmount = parseFloat(row._sum.preTaxAmount as unknown as string)
        }
        return row
      }),
    [totalSalesByCategory.data],
  )

  const totalSalesByConditionData = useMemo(
    () =>
      totalSalesByCondition.data?.data.map((row) => {
        if (row._sum.preTaxAmount) {
          row._sum.preTaxAmount = parseFloat(row._sum.preTaxAmount as unknown as string)
        }
        return row
      }),
    [totalSalesByCondition.data],
  )

  const refreshData = useCallback(() => {
    totalSalesPerDay.refetch()
    totalSalesByCategory.refetch()
    totalSalesByCondition.refetch()
  }, [totalSalesPerDay, totalSalesByCategory, totalSalesByCondition])

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <BarRechartWithoutSSR
          data={totalSalesPerDayData}
          barDataKey="_sum.preTaxAmount"
          barName="Total"
          xAxisDataKey="date"
          xAxisLabel="Day"
          title="Pre-Tax Amount Totals By Day"
        />
        <PieRechartWithoutSSR
          data={totalSalesByCategoryData}
          dataKey="_sum.preTaxAmount"
          nameKey="category.name"
          title="Pre-Tax Amount Totals By Item Category"
        />
        <PieRechartWithoutSSR
          data={totalSalesByConditionData}
          dataKey="_sum.preTaxAmount"
          nameKey="condition.description"
          title="Pre-Tax Amount Totals By Item Condition"
        />
        <FileDropzone refreshData={refreshData} />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer">
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = withCSR(
  async (ctx: GetServerSidePropsContext) => {
    const queryClient = new QueryClient()

    await queryClient.prefetchQuery(["itemSalesDailyTotals"], () =>
      get({
        route: "/itemSales",
        params: {
          groupBy: "date",
          orderBy: "date",
          sum: "preTaxAmount",
        },
      }),
    )

    await queryClient.prefetchQuery(["categoriesTotalSales"], () =>
      get({ route: "/categories/totalSales" }),
    )
    await queryClient.prefetchQuery(["conditionsTotalSales"], () =>
      get({ route: "/conditions/totalSales" }),
    )

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
      },
    }
  },
)

export default Home
