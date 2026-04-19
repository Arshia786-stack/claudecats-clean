import { Router } from 'express'
import {
  getAvailableListings,
  getAllListings,
  addListing,
  reserveListing,
} from '../../data/listings.js'

const router = Router()

// GET /api/listings/available
router.get('/available', (_req, res) => {
  res.json(getAvailableListings())
})

// GET /api/listings/all  — full library (includes images, reserved)
router.get('/all', (_req, res) => {
  res.json(getAllListings())
})

// POST /api/listings/add
// Body: parsed listing object from Claude's parse-listing response
router.post('/add', (req, res) => {
  const parsed = req.body
  if (!parsed || !parsed.title) {
    return res.status(400).json({ error: 'Parsed listing with title required' })
  }
  const listing = addListing(parsed)
  res.json({ success: true, id: listing.id, listing })
})

// POST /api/listings/reserve
// Body: { listingId, seekerSessionId }
router.post('/reserve', (req, res) => {
  const { listingId } = req.body
  if (!listingId) return res.status(400).json({ error: 'listingId required' })

  const listing = reserveListing(listingId)
  if (!listing) return res.status(404).json({ error: 'Listing not found' })

  res.json({ success: true })
})

export default router
