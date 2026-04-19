// lib/types.ts
// Shared types for Hearth. Imported by API routes and UI components.
// If you change a shape here, tell the team in Slack before committing.

export type FoodListing = {
  id: string;
  listing_title: string;
  listing_emoji: string;
  food_items: string[];
  portions: number;
  dietary_flags: string[];
  allergens_present: string[];
  pickup_location: string;
  pickup_window: string;
  safety_passed: boolean;
};

export type MatchResult = {
  listing_id: string;
  listing_title: string;
  listing_emoji: string;
  compatibility_score: number;
  match_reason: string;
  prep_instructions: string;
  flags: string[];
};

export type SeekerProfile = {
  dietary_restrictions: string[];
  health_conditions: string[];
  cultural_preferences: string[];
  kitchen: 'microwave' | 'hotplate' | 'full';
  favorite_ingredients: string[];
  avoid: string[];
};

export type CallScriptResponse = {
  status: 'call_initiated';
  script: string;
  provider: string;
  pickup_time: string;
};

export type NotifyResponse = {
  notification: string;
  hearts_earned: number;
  hearts_total: number;
  next_milestone_distance: number;
};

export type ApiError = {
  error: string;
  raw?: string;
};
