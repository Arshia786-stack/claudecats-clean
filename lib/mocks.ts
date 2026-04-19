// lib/mocks.ts
// Mock data for frontend development before live APIs are ready.

import type { FoodListing, MatchResult, NotifyResponse, SeekerProfile } from './types';

export const MOCK_MATCHES: MatchResult[] = [
  {
    listing_id: 'rec001',
    listing_title: 'Homemade Jollof Rice',
    listing_emoji: '🍚',
    compatibility_score: 9.2,
    match_reason: 'This is halal and has the spicy West African flavors you mentioned.',
    prep_instructions: 'Heat in microwave 3-4 min. Cover with a damp paper towel.',
    flags: [],
  },
  {
    listing_id: 'rec002',
    listing_title: 'Red Lentil Dal',
    listing_emoji: '🥘',
    compatibility_score: 8.7,
    match_reason: 'Lentil-based, microwave-friendly, and naturally diabetic-friendly.',
    prep_instructions: 'Microwave 2 min, stir halfway. Add water if it seems dry.',
    flags: [],
  },
];

export const MOCK_LISTING: FoodListing = {
  id: 'rec001',
  listing_title: 'Homemade Jollof Rice',
  listing_emoji: '🍚',
  food_items: ['jollof rice'],
  portions: 8,
  dietary_flags: ['halal', 'nut-free', 'dairy-free'],
  allergens_present: [],
  pickup_location: 'Near Dorm 4',
  pickup_window: 'Tonight before 8pm',
  safety_passed: true,
};

export const MOCK_SEEKER_PROFILE: SeekerProfile = {
  dietary_restrictions: ['halal'],
  health_conditions: ['diabetic'],
  cultural_preferences: ['West African', 'rice dishes', 'stews'],
  kitchen: 'microwave',
  favorite_ingredients: ['rice', 'lentils', 'anything spicy'],
  avoid: [],
};

export const MOCK_NOTIFICATION: NotifyResponse = {
  notification: "Hey Amara — the jollof rice you made tonight went to a student from West Africa who hadn't had food that felt like home in weeks. +15 Hearth Hearts (total: 15). You're 85 away from your first reward.",
  hearts_earned: 15,
  hearts_total: 15,
  next_milestone_distance: 85,
};
