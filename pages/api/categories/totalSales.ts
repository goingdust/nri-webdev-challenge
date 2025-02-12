import nc from "next-connect"
import { getCategoriesSaleTotals } from "../../../controllers/CategoriesController"
import onError from "../../../middlewares/errors"

const handler = nc({ onError })

handler.get(getCategoriesSaleTotals)

export default handler
