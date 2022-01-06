import Matching from './Matching'
import scoring from './scoring'
import TimeEstimates from './TimeEstimates'
import Feedback from './Feedback'
import Options from './Options'
import { MatchEstimated, MatchExtended, ZxcvbnResult } from './types'

const time = () => new Date().getTime()

const createReturnValue = (
  resolvedMatches: MatchExtended[],
  password: string,
  start: number,
): ZxcvbnResult => {
  const feedback = new Feedback()
  const timeEstimates = new TimeEstimates()
  const matchSequence = scoring.mostGuessableMatchSequence(
    password,
    resolvedMatches,
  )
  const calcTime = time() - start
  const attackTimes = timeEstimates.estimateAttackTimes(matchSequence.guesses)

  return {
    calcTime,
    ...matchSequence,
    ...attackTimes,
    feedback: feedback.getFeedback(
      attackTimes.score,
      matchSequence.sequence as MatchEstimated[],
    ),
  }
}

const main = (password: string, userInputs?: (string | number)[]) => {
  if (userInputs) {
    Options.extendUserInputsDictionary(userInputs)
  }

  const matching = new Matching()

  return matching.match(password)
}

export const zxcvbn = (password: string, userInputs?: (string | number)[]) => {
  const start = time()
  const matches = main(password, userInputs)

  if (matches instanceof Promise) {
    throw new Error(
      'You are using a Promised matcher, please use `zxcvbnAsync` for it.',
    )
  }
  return createReturnValue(matches, password, start)
}

export const zxcvbnAsync = async (
  password: string,
  userInputs?: (string | number)[],
): Promise<ZxcvbnResult> => {
  const start = time()
  const matches = await main(password, userInputs)

  return createReturnValue(matches, password, start)
}

export { Options as ZxcvbnOptions, ZxcvbnResult }
