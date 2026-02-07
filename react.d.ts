// Declaração temporária até que @types/react seja instalado
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare namespace React {
  export interface ReactElement {
    type: any;
    props: any;
    key: any;
  }
  
  export type ReactNode = ReactElement | string | number | boolean | null | undefined;
  
  export interface Context<T> {
    Provider: ComponentType<{ value: T; children?: ReactNode }>;
    Consumer: ComponentType<{ children: (value: T) => ReactNode }>;
  }
  
  export interface ComponentType<P = {}> {
    (props: P): ReactElement | null;
  }
}

declare module 'react' {
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useState<T>(initial: T): [T, (value: T) => void];
  export function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: any[]
  ): T;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useRef<T>(initial: T): { current: T };
  export function useContext<T>(context: React.Context<T>): T;
  export function useReducer<R>(
    reducer: (state: R, action: any) => R,
    initialState: R
  ): [R, (action: any) => void];
  export function useLayoutEffect(effect: () => void | (() => void), deps?: any[]): void;
}

export {};
