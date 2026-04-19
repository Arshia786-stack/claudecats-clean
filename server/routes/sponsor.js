import { Router } from 'express'

const router = Router()

// GET /api/sponsor/stats
// Returns hardcoded but realistic impact numbers as specified in HEARTH-design.md
router.get('/stats', (_req, res) => {
  res.json({
    totalMeals: 847,
    totalActiveProviders: 124,
    totalDietaryCategoriesCovered: 31,
    totalPointsAwarded: 9420,
    totalPointsRedeemed: 1380,
    recentMilestones: [
      'Amara K. reached Hero status — 42 portions shared',
      'CS Department crossed 200 meals contributed',
      'Priya hit 100 FULL Points — new Regular badge',
      'Community Fridge: 500+ meals served this semester',
      'Fatima awarded top provider this week — 60 portions',
    ],
  })
})

export default router
