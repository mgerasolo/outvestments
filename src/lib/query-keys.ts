/**
 * Query key factory for TanStack Query.
 * Provides type-safe, hierarchical query keys for cache management.
 *
 * Key hierarchy follows the data model:
 * - targets (investment targets/goals)
 *   - aims (specific aims within a target)
 *     - shots (trading attempts within an aim)
 * - users
 *   - scores (user performance scores)
 */

/**
 * Type definitions for query keys to ensure type safety.
 */
export type TargetsKey = readonly ['targets'];
export type TargetKey = readonly ['targets', string];
export type AimsKey = readonly ['targets', string, 'aims'];
export type AimKey = readonly ['targets', string, 'aims', string];
export type ShotsKey = readonly ['targets', string, 'aims', string, 'shots'];
export type ScoresKey = readonly ['users', string, 'scores'];

/**
 * Query key factory object.
 * Use these functions to generate consistent query keys throughout the application.
 *
 * @example
 * ```ts
 * // Fetch all targets
 * useQuery({ queryKey: queryKeys.targets, queryFn: fetchTargets });
 *
 * // Fetch a specific target
 * useQuery({ queryKey: queryKeys.target(targetId), queryFn: () => fetchTarget(targetId) });
 *
 * // Invalidate all aims for a target
 * queryClient.invalidateQueries({ queryKey: queryKeys.aims(targetId) });
 * ```
 */
export const queryKeys = {
  /**
   * Key for fetching all targets.
   */
  targets: ['targets'] as const,

  /**
   * Key for fetching a specific target by ID.
   * @param id - The target ID
   */
  target: (id: string): TargetKey => ['targets', id] as const,

  /**
   * Key for fetching all aims for a specific target.
   * @param targetId - The parent target ID
   */
  aims: (targetId: string): AimsKey => ['targets', targetId, 'aims'] as const,

  /**
   * Key for fetching a specific aim within a target.
   * @param targetId - The parent target ID
   * @param aimId - The aim ID
   */
  aim: (targetId: string, aimId: string): AimKey =>
    ['targets', targetId, 'aims', aimId] as const,

  /**
   * Key for fetching all shots for a specific aim.
   * @param targetId - The grandparent target ID
   * @param aimId - The parent aim ID
   */
  shots: (targetId: string, aimId: string): ShotsKey =>
    ['targets', targetId, 'aims', aimId, 'shots'] as const,

  /**
   * Key for fetching scores for a specific user.
   * @param userId - The user ID
   */
  scores: (userId: string): ScoresKey => ['users', userId, 'scores'] as const,
} as const;

/**
 * Union type of all possible query keys.
 * Useful for type-safe query key handling in utilities.
 */
export type QueryKey =
  | TargetsKey
  | TargetKey
  | AimsKey
  | AimKey
  | ShotsKey
  | ScoresKey;
