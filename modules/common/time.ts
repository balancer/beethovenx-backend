import moment from 'moment-timezone';

export const oneMinuteInSeconds = 60;
export const fiveMinutesInSeconds = oneMinuteInSeconds * 5;
export const fiveMinutesInMs = fiveMinutesInSeconds * 1000;

export const oneSecondInMs = 1000;
export const oneMinInMs = 60 * oneSecondInMs;
export const oneHourInMs = 60 * oneMinInMs;

export const thirtyMinInMs = 30 * 60 * oneSecondInMs;
export const twentyFourHoursInMs = 24 * oneHourInMs;
export const twentyFourHoursInSecs = twentyFourHoursInMs / oneSecondInMs;

export const oneDayInMinutes = 60 * 24;
export const oneDayInSeconds = oneDayInMinutes * 60;
export const thirtyDaysInSeconds = 60 * 60 * 24 * 30;
export const thirtyDaysInMinutes = oneDayInMinutes * 30;
export const timeNowInMs = Math.floor(Date.now() / oneSecondInMs);

export const secondsPerDay = 86400;
export const secondsPerYear = secondsPerDay * 365;

export function getDailyTimestampRanges(numDays: number): [number, number][] {
    const timestamps: [number, number][] = [];
    const endTime = moment.tz('GMT').subtract(numDays, 'days').startOf('day');
    let current = moment.tz('GMT').endOf('day');

    while (current.isAfter(endTime)) {
        timestamps.push([current.clone().startOf('day').unix(), current.unix()]);

        current = current.subtract(1, 'day');
    }

    return timestamps;
}

export function getHourlyTimestamps(startTimestamp: number, endTimestamp: number): number[] {
    let current = moment.unix(startTimestamp);
    const timestamps: number[] = [];

    while (current.unix() < endTimestamp) {
        timestamps.push(current.unix());
        current = current.add(1, 'hour');
    }

    return timestamps;
}

export function getHourlyTimestampsForDays(numDays: number): number[] {
    const timestamps: number[] = [];

    const endTime = moment.tz('GMT').subtract(numDays, 'days').startOf('day');
    let current = moment.tz('GMT').startOf('hour');

    while (current.isAfter(endTime)) {
        timestamps.push(current.unix());

        current = current.subtract(1, 'hour');
    }

    return timestamps;
}

export function getHourlyTimestampsWithBuffer(numDays: number): number[] {
    let timestamps: number[] = [];

    const endTime = moment.tz('GMT').subtract(numDays, 'days').startOf('day');
    let current = moment.tz('GMT').startOf('hour');

    while (current.isAfter(endTime)) {
        timestamps = [
            ...timestamps,
            //we create a buffer of 3 seconds to match on to ensure we get at least one block for this hour
            current.clone().subtract(1, 'second').unix(),
            current.unix(),
            current.clone().add(1, 'second').unix(),
        ];

        current = current.subtract(1, 'hour');
    }

    return timestamps;
}

export function getDailyTimestampsForDays(numDays: number): number[] {
    const timestamps: number[] = [];

    const endTime = moment.tz('GMT').subtract(numDays, 'days').startOf('day');
    let current = moment.tz('GMT').startOf('day');

    while (current.isAfter(endTime)) {
        timestamps.push(current.unix());

        current = current.subtract(1, 'day');
    }

    return timestamps;
}

export function getDailyTimestampsWithBuffer(numDays: number): number[] {
    let timestamps: number[] = [];

    const endTime = moment.tz('GMT').subtract(numDays, 'days').startOf('day');
    let current = moment.tz('GMT').startOf('day');

    while (current.isAfter(endTime)) {
        timestamps = [
            ...timestamps,
            //we create a buffer of 20 seconds to match on to ensure we get at least one block for this hour
            current.clone().subtract(10, 'second').unix(),
            current.clone().subtract(9, 'second').unix(),
            current.clone().subtract(8, 'second').unix(),
            current.clone().subtract(7, 'second').unix(),
            current.clone().subtract(6, 'second').unix(),
            current.clone().subtract(5, 'second').unix(),
            current.clone().subtract(4, 'second').unix(),
            current.clone().subtract(3, 'second').unix(),
            current.clone().subtract(2, 'second').unix(),
            current.clone().subtract(1, 'second').unix(),
            current.unix(),
            current.clone().add(1, 'second').unix(),
            current.clone().add(2, 'second').unix(),
            current.clone().add(3, 'second').unix(),
            current.clone().add(4, 'second').unix(),
            current.clone().add(5, 'second').unix(),
            current.clone().add(6, 'second').unix(),
            current.clone().add(7, 'second').unix(),
            current.clone().add(8, 'second').unix(),
            current.clone().add(9, 'second').unix(),
            current.clone().add(10, 'second').unix(),
        ];

        current = current.subtract(1, 'day');
    }

    return timestamps;
}

export function timestampRoundedUpToNearestHour(m: moment.Moment = moment()): number {
    const roundUp = m.second() || m.millisecond() || m.minute() ? m.add(1, 'hour').startOf('hour') : m.startOf('hour');

    return roundUp.unix();
}

/**
 * Time helper to round timestamp to the nearest hour
 */
export const roundToHour = (timestamp: number) => Math.floor(timestamp / 3600) * 3600;

/**
 * Time helper to round timestamp down to the midnight
 */
export const roundToMidnight = (timestamp: number) => Math.floor(timestamp / 86400) * 86400;

/**
 * Time helper to round timestamp to the next midnight
 */
export const roundToNextMidnight = (timestamp: number) => roundToMidnight(timestamp + 86400);

/**
 * Returns the timestamp for the days ago
 *
 * @param daysAgo
 * @returns
 */
export const daysAgo = (daysAgo: number): number => {
    return Math.floor(+new Date(Date.now() - daysAgo * secondsPerDay * 1000) / 1000);
};

/**
 * Returns the timestamp for the hours ago
 *
 * @param daysAgo
 * @returns
 */
export const hoursAgo = (hoursAgo: number): number => {
    return Math.floor(+new Date(Date.now() - hoursAgo * 60 * 1000) / 1000);
};

export const now = (): number => Math.floor(Date.now() / 1000);
