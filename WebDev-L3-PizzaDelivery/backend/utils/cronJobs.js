import cron from 'node-cron'
import Inventory from '../models/Inventory.js'
import { sendLowStockAlertEmail } from './emailService.js'

export const checkLowStockAndNotify = async () => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$stock', '$threshold'] }
    })

    if (lowStockItems.length > 0) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@pizzadelivery.com'
      console.log(`[CRON] Detected ${lowStockItems.length} inventory items below threshold. Triggering alert.`)
      await sendLowStockAlertEmail(adminEmail, lowStockItems)
    } else {
      console.log('[CRON] Inventory check clean: All items above safety threshold.')
    }
  } catch (error) {
    console.error(`[CRON ERROR] Failed during inventory stock verification: ${error.message}`)
  }
}

export const initInventoryCron = () => {
  cron.schedule('*/30 * * * *', async () => {
    console.log('[CRON] Executing scheduled 30-minute inventory stock audit...')
    await checkLowStockAndNotify()
  })

  console.log('[CRON] Inventory alert scheduler initialized (running every 30 minutes)')
}
