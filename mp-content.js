// ===== Shared content & primitives for Oakhouse Ministry Plan Template =====
// All three variations consume from window.MP — same data, different chrome.

window.MP = (() => {
  const QUARTERS = [
    { n: 1, label: 'Quarter 1', date: 'Sep 30', months: ['JULY', 'AUGUST', 'SEPTEMBER'] },
    { n: 2, label: 'Quarter 2', date: 'Dec 31', months: ['OCTOBER', 'NOVEMBER', 'DECEMBER'] },
    { n: 3, label: 'Quarter 3', date: 'Mar 31', months: ['JANUARY', 'FEBRUARY', 'MARCH'] },
    { n: 4, label: 'Quarter 4', date: 'Jun 30', months: ['APRIL', 'MAY', 'JUNE'] },
  ];

  const PERSONAL_PROMPTS = [
    'How are you doing with The Five?',
    'What\u2019s bringing you joy in ministry right now?',
    'What challenges are you carrying personally?',
    'What development do you need this quarter?',
    'Books, conferences, or coaching desired?',
  ];

  const PERSONAL_FIVE_SCALES = [
    'Hour a Day',
    'One Step a Week',
    'One Cause',
    'One Group',
    'One Teacher',
  ];

  const VALUES_INTRO_MINISTRY =
    'Set the less-tangible goals here. Some prompts: \u201cWhat do I want everyone to know after engaging with my ministry?\u201d \u201cWhy would people care about what we\u2019re doing this year?\u201d \u201cWhat new data do I want to integrate into everything I do?\u201d';

  const VALUES_INTRO_DEPARTMENT =
    'Set the less-tangible goals here. Some prompts: \u201cWhat do I want our volunteers to know matters?\u201d \u201cHow do we want to stand out?\u201d \u201cWhat new data do I want to integrate into everything I do?\u201d';

  // Values rows are now dynamic — users add/remove them. No row title.
  const VALUES_COLS = [
    'Value statement',
    'How will you embody this, personally?',
    'What is expected of leaders and volunteers?',
    'Action steps to integrate this',
  ];

  const FIVE_BLURB =
    'We spend One Hour a Day with Jesus through reading, prayer, and worship through music. This creates the foundation we stand on.';

  const FIVE_QUESTIONS_MINISTRY = [
    'How will you encourage your volunteers to participate in The Five this year?',
  ];
  const FIVE_QUESTIONS_DEPARTMENT = [
    'How will you encourage your volunteers to participate in The Five this year?',
  ];

  const GOAL_CATEGORIES = ['Fun', 'Risk', 'Excellence'];
  const CARE_CATEGORIES = ['Care', 'Communicate', 'Equip'];
  const GOAL_COLS = [
    'Goal',
    'Why does this matter?',
    'What are you tracking for \u201csuccess\u201d?',
    'Quarter',
    'Action steps',
  ];

  const TEAM_ROWS = ['Volunteers', 'Leaders'];
  const TEAM_COLS = ['Current numbers', 'Goal numbers', 'Top priority', 'Action steps'];

  const METRICS_COLS = [
    'Description',
    'Previous ministry year',
    'Change from the year before last',
    'How are you tracking this?',
    'Goal for this year',
    'Action steps to reach your goal',
  ];

  const PROGRAMMING_QUESTIONS = [
    'Is it time to stop any programming?',
    'Can you change any programming to incorporate values or increase attendance?',
    'Will you add any programming to better reach your goals?',
    'What challenges do you see with your current programming plans?',
  ];

  const RESOURCES_COLS_MINISTRY = [
    'Event or initiative',
    'Financial needs and factors',
    'Staff needs and factors',
    'Volunteer needs and factors',
    'Reality check \u2014 can you do this with what you currently have?',
    'Dream big \u2014 ideas to get to where you need to be',
  ];
  const RESOURCES_COLS_DEPARTMENT = [
    'Event or purchase',
    'Financial needs and factors',
    'Staff needs and factors',
    'Volunteer needs and factors',
    'Reality check \u2014 can you do this with what you currently have?',
    'Dream big \u2014 ideas to get to where you need to be',
  ];

  return {
    QUARTERS,
    PERSONAL_PROMPTS,
    PERSONAL_FIVE_SCALES,
    VALUES_INTRO_MINISTRY,
    VALUES_INTRO_DEPARTMENT,
    VALUES_COLS,
    FIVE_BLURB,
    FIVE_QUESTIONS_MINISTRY,
    FIVE_QUESTIONS_DEPARTMENT,
    GOAL_CATEGORIES,
    CARE_CATEGORIES,
    GOAL_COLS,
    TEAM_ROWS,
    TEAM_COLS,
    METRICS_COLS,
    PROGRAMMING_QUESTIONS,
    RESOURCES_COLS_MINISTRY,
    RESOURCES_COLS_DEPARTMENT,
  };
})();
