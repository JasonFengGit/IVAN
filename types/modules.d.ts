declare module '@/store' {
    const store: any;
    export type RootState = ReturnType<typeof store.getState>
    export const useTypedSelector;
    export default store;
  }