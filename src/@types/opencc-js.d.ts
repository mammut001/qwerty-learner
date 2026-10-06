declare module 'opencc-js/t2cn' {
  export type Locale = 'cn' | 'tw' | 'hk' | 'twp' | 'jp' | 't'
  export interface ConverterOptions {
    from?: Locale
    to?: Locale
  }
  export function Converter(options: ConverterOptions): (text: string) => string
}
