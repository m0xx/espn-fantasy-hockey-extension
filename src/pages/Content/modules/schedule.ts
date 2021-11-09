interface ScheduleDay {
  index: number,
  isPlaying: boolean,
  isProbableGoalie: boolean
}

interface PlayerSummary {
  slot: Slot,
  schedules: ScheduleDay[],
  scheduleStats: {
    today: boolean,
    next7: number,
    next8: number,
  }
}

enum ColumnIndex {
  Slot= 0,
  Player= 1,
  Action= 2,
  Today= 3,
  Today_Status= 4,
  Upcoming_1= 5,
  Upcoming_2= 6,
  Upcoming_3= 7,
  Upcoming_4= 8,
  Upcoming_5= 9,
  Upcoming_6= 10,
  Upcoming_7= 11,
}

enum Slot {
  Center= 'C',
  Left_Wing= 'LW',
  Right_Wing= 'LW',
  Defense= 'D',
  Util= 'UTIL',
  Bench= 'Bench',
  Injury_Reserve= 'IR',
  Goalie= 'G',
}

const getColumnIndex = (column: ColumnIndex) => {
  return !isAdminPage() && column > ColumnIndex.Action ? column - 1 : column
}

const isAdminPage = () => document.querySelector('.team-settings-link') !== null

const getElements = (selector: string, el?: Element) => Array.from(el ? el.querySelectorAll(selector) : document.querySelectorAll(selector))

const getTab = (name: string) => getElements('.tabs__nav button.tabs__link').find(t => t.textContent ? t.textContent.trim() === name : false)

const shouldCount = (slot: Slot, scheduleDay: ScheduleDay) => {
  if(scheduleDay.isProbableGoalie) {
    return true;
  }

  return (slot === Slot.Goalie ||
      slot === Slot.Bench ||
      slot === Slot.Injury_Reserve) ? false : scheduleDay.isPlaying
}

const countGames = (slot: Slot, scheduleDays: ScheduleDay[]) => {
  return scheduleDays.reduce((total, scheduleDay) => {
    return shouldCount(slot, scheduleDay)
      ? total + 1
      : total
  }, 0)
}


const parseScheduleCell = (cell: Element, index: number) => {
  const opp = cell.querySelector('div[title="Opponent"]')
  if(!opp || opp.textContent === '--') {
    return {
      index,
      isPlaying: false,
      isProbableGoalie: false
    }
  }

  const probableGoalieEL = opp.querySelector('.playerinfo__start-indicator ')
  return {
    index,
    isPlaying: true,
    isProbableGoalie: probableGoalieEL !== null
  }
}

const parsePlayers = () => {
  const playerSummaries: PlayerSummary[] = []
  const playerRows = getElements('.players-table table tbody.Table__TBODY tr')
  playerRows.forEach((row) => {
    const cols = row.querySelectorAll('td');
    const slot = cols[getColumnIndex(ColumnIndex.Slot)].textContent as Slot;

    const schedules = [
      getColumnIndex(ColumnIndex.Today),
      getColumnIndex(ColumnIndex.Upcoming_1),
      getColumnIndex(ColumnIndex.Upcoming_2),
      getColumnIndex(ColumnIndex.Upcoming_3),
      getColumnIndex(ColumnIndex.Upcoming_4),
      getColumnIndex(ColumnIndex.Upcoming_5),
      getColumnIndex(ColumnIndex.Upcoming_6),
      getColumnIndex(ColumnIndex.Upcoming_7),
    ].map((colIndex, dayIndex) => parseScheduleCell(cols[colIndex], dayIndex));

    playerSummaries.push({
      slot,
      schedules,
      scheduleStats: {
        today: shouldCount(slot, schedules[0]),
        next7: countGames(slot, schedules.slice(0, 7)),
        next8: countGames(slot, schedules.slice(0, 8)),
      }
    })

  })

  return playerSummaries;
}

export const computeScheduleStats = () => {
    const scheduleTab = getTab('Schedule')

    console.log('Schedule Tab', scheduleTab)
    if(scheduleTab) {
      const summaries = parsePlayers()

      const next7 = summaries.reduce((total, playerSummary) => playerSummary.scheduleStats.next7 + total, 0)
      console.log(summaries)
      scheduleTab.append(` (${next7})`)
    }

};
