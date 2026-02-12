-- Backfill user_id for Challenge Match History
-- Links user_challenge_progress to match_history based on fuzzy timestamp matching (within 2 seconds) and challenge ID.

UPDATE public.match_history mh
SET user_id = ucp.user_id
FROM public.user_challenge_progress ucp
WHERE 
    -- Target only challenge records missing a user_id
    mh.mode = 'challenge' 
    AND mh.user_id IS NULL 
    
    -- Match by Challenge ID (Note: match_history uses results->>challengeId)
    AND (mh.results->>'challengeId') = ucp.challenge_id
    
    -- Fuzzy Timestamp Match (within 2 seconds diff)
    -- This accounts for slight delays between the two inserts in the client/server logic
    AND (
        mh.played_at > ucp.executed_at - interval '2 seconds'
        AND 
        mh.played_at < ucp.executed_at + interval '2 seconds'
    );

-- Optional: Verify results
-- SELECT * FROM match_history WHERE mode='challenge' AND user_id IS NOT NULL;
