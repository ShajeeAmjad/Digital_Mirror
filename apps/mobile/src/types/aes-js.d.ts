declare module 'aes-js' {
  namespace aesjs {
    namespace utils {
      namespace utf8 {
        function toBytes(text: string): Uint8Array;
        function fromBytes(bytes: Uint8Array): string;
      }
      namespace hex {
        function fromBytes(bytes: Uint8Array): string;
        function toBytes(hex: string): Uint8Array;
      }
    }

    class ModeOfOperation {
      static ctr: typeof Ctr;
    }

    class Ctr {
      constructor(key: Uint8Array, counter?: Uint8Array);
      encrypt(bytes: Uint8Array): Uint8Array;
      decrypt(bytes: Uint8Array): Uint8Array;
    }
  }
  export = aesjs;
}
