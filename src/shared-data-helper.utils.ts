export class SharedDataHelper {
    public static sharedWithToString(sharedWith: string[]) {
        return sharedWith.reduce((acc, curr, idx) => {
            acc += `${curr}${(idx >= sharedWith.length - 1) ? '' : ','}`.trim();
            return acc;
        }, '');
    }
    public static sharedWithToArray(sharedWith: string) {
        if(!sharedWith.trim()) {
            return [];
        }
        return sharedWith.trim().split(',');
    }
}
