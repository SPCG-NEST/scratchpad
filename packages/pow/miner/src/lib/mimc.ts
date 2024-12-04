// Uses BigInt for handling large numbers securely
export class MiMC {
    private readonly rounds: number;
    private readonly p: bigint;
    private readonly seed: bigint;
    private roundConstants: bigint[];

    constructor(rounds: number = 220, seed: string = "mimc") {
        this.rounds = rounds;
        // Field size for alt-bn128 (BN254) curve
        // p = 21888242871839275222246405745257275088548364400416034343698204186575808495617
        this.p = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
        this.seed = BigInt(this.stringToHex(seed));
        this.roundConstants = this.generateConstants();
    }

    private stringToHex(str: string): string {
        return "0x" + Array.from(str)
            .map(c => c.charCodeAt(0).toString(16).padStart(2, "0"))
            .join("");
    }

    private generateConstants(): bigint[] {
        const constants: bigint[] = [];
        let c = this.seed;

        for (let i = 0; i < this.rounds; i++) {
            // Generate pseudorandom constants using the seed
            c = this.modulo(
                (c * c * c) + BigInt(i),
                this.p
            );
            constants.push(c);
        }

        return constants;
    }

    private modulo(a: bigint, m: bigint): bigint {
        return ((a % m) + m) % m;
    }

    private mimc(x: bigint, k: bigint): bigint {
        let xi = x;

        // Apply round function
        for (let i = 0; i < this.rounds; i++) {
            // Add key and round constant
            xi = this.modulo(xi + k + this.roundConstants[i], this.p);

            // Cube operation
            xi = this.modulo(xi * xi * xi, this.p);
        }

        // Final key addition
        return this.modulo(xi + k, this.p);
    }

    private processInput(input: bigint | string | number): bigint {
        if (typeof input === "string") {
            if (input.startsWith("0x")) {
                return BigInt(input);
            }
            return BigInt(this.stringToHex(input));
        }
        if (typeof input === "number") {
            return BigInt(input);
        }
        return input;
    }

    public hash(input: bigint | string | number): string {
        const x = this.processInput(input);
        // Unkeyed version uses 0 as key
        const result = this.mimc(x, BigInt(0));
        return "0x" + result.toString(16);
    }

    public hashWithKey(input: bigint | string | number, key: bigint | string | number): string {
        const x = this.processInput(input);
        const k = this.processInput(key);
        const result = this.mimc(x, k);
        return "0x" + result.toString(16);
    }

    // Helper method to check if a value is within the valid field range
    public isValidField(value: bigint): boolean {
        return value >= BigInt(0) && value < this.p;
    }
}