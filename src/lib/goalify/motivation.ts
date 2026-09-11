/**
 * The daily creed bank — toxic, sarcastic, no-mercy one-liners. Not
 * encouragement; a roast. `DailyCreed` cycles through this list on a
 * timer, so order doesn't matter and nothing here needs to be
 * deterministic per day the way an earlier, gentler version of this list
 * was.
 */

export type Creed = {
  /** The punch — short enough to land in one glance. */
  line: string;
  /** The knife twist underneath it. */
  sub: string;
};

export const CREEDS: Creed[] = [
  {
    line: "NOBODY'S COMING TO SAVE YOU",
    sub: "Not your trainer, not your horoscope. Get up.",
  },
  {
    line: "YOUR EXCUSES ARE BORING",
    sub: "Honestly, even you don't believe them anymore.",
  },
  {
    line: "STILL WAITING FOR MOTIVATION?",
    sub: "Cute. It's not coming. Move anyway.",
  },
  {
    line: "THE MIRROR DOESN'T LIE",
    sub: "Unlike your Instagram captions.",
  },
  {
    line: "THAT'S NOT TIRED, THAT'S SOFT",
    sub: "Tired is what happens after the workout. This is just Tuesday.",
  },
  {
    line: "COMFORTABLE IS A CAGE",
    sub: "You built it yourself. Here's the door.",
  },
  {
    line: "YOUR BODY DOESN'T CARE ABOUT YOUR BAD DAY",
    sub: "It just knows whether you showed up or not.",
  },
  {
    line: "STOP NEGOTIATING WITH YOURSELF",
    sub: "You always let you win. That's exactly the problem.",
  },
  {
    line: "SAME EXCUSE, DIFFERENT DAY",
    sub: "At least be original. Or just go train.",
  },
  {
    line: "YOUR FUTURE SELF IS EMBARRASSED",
    sub: "Watching you scroll instead of training. Right now.",
  },
  {
    line: "THIS IS THE PART YOU KEEP SKIPPING",
    sub: "It's also the only part that actually works.",
  },
  {
    line: "TALK IS FREE. RESULTS AREN'T",
    sub: "Pay up.",
  },
  {
    line: "YOU HAD ALL DAY",
    sub: "And you're doing this now. Fine. Go.",
  },
  {
    line: "NOBODY'S IMPRESSED YET",
    sub: "Give them a reason to be.",
  },
  {
    line: "IT'S NOT GOING TO FEEL LIKE IT",
    sub: "It never does. Start anyway — that's the whole trick.",
  },
];

export const CREED_COUNT = CREEDS.length;
