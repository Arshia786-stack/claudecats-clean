import { Router } from 'express'
import { getProviderPoints, addProviderPoints } from '../../data/listings.js'

const router = Router()

const BADGE_THRESHOLDS = [
  { name: 'Legend', min: 500, next: null, nextThreshold: null },
  { name: 'Hero', min: 250, next: 'Legend', nextThreshold: 500 },
  { name: 'Regular', min: 100, next: 'Hero', nextThreshold: 250 },
  { name: 'Feeder', min: 0, next: 'Regular', nextThreshold: 100 },
]

function getBadgeInfo(total) {
  for (const tier of BADGE_THRESHOLDS) {
    if (total >= tier.min) {
      return {
        badge: tier.name,
        nextMilestoneName: tier.next || 'Community Feast',
        nextMilestoneThreshold: tier.nextThreshold || 500,
      }
    }
  }
  return { badge: 'Feeder', nextMilestoneName: 'Regular', nextMilestoneThreshold: 100 }
}

// POST /api/points/award
// Body: { providerName, portions, dietaryFlags }
// Formula: 2pts per portion + 5 bonus if halal or allergy-safe
router.post('/award', (req, res) => {
  const { providerName, portions, dietaryFlags = [] } = req.body
  if (!providerName) return res.status(400).json({ error: 'providerName required' })

  const portionCount = Number(portions) || 1
  const diversityBonus =
    dietaryFlags.includes('halal') ||
    dietaryFlags.some((f) => f.includes('free') || f.includes('nut-free'))
      ? 5
      : 0

  const pointsEarned = portionCount * 2 + diversityBonus
  const newTotal = addProviderPoints(providerName, pointsEarned)
  const { badge, nextMilestoneName, nextMilestoneThreshold } = getBadgeInfo(newTotal)

  res.json({
    pointsEarned,
    newTotal,
    badge,
    nextMilestoneName,
    nextMilestoneThreshold,
  })
})

export default router
