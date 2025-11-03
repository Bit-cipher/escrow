import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_2022_PROGRAM_ID
} from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Escrow } from "../target/types/escrow";

describe("dynamic escrow test", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Escrow as Program<Escrow>;

  const connection = provider.connection;
  const payer = provider.wallet as anchor.Wallet;

  const tokenProgram = TOKEN_2022_PROGRAM_ID;

  let maker: Keypair;
  let taker: Keypair;

  let mintA: PublicKey;
  let mintB: PublicKey;

  let makerAtaA: PublicKey;
  let makerAtaB: PublicKey;
  let takerAtaA: PublicKey;
  let takerAtaB: PublicKey;
  let vault: PublicKey;
  let escrowPDA: PublicKey;
  let escrowBump: number;

  before(async () => {
    console.log("⏳ Setting up test...");

    maker = Keypair.generate();
    taker = Keypair.generate();

    await connection.requestAirdrop(maker.publicKey, 2e9);
    await connection.requestAirdrop(taker.publicKey, 2e9);

    mintA = await createMint(
      connection,
      payer.payer,
      payer.publicKey,
      null,
      9, // decimals
      undefined,
      undefined,
      tokenProgram
    );

    mintB = await createMint(
      connection,
      payer.payer,
      payer.publicKey,
      null,
      9,
      undefined,
      undefined,
      tokenProgram
    );

    makerAtaA = (await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      mintA,
      maker.publicKey,
      true,
      undefined,
      undefined,
      tokenProgram
    )).address;

    makerAtaB = (await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      mintB,
      maker.publicKey,
      true,
      undefined,
      undefined,
      tokenProgram
    )).address;

    takerAtaA = (await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      mintA,
      taker.publicKey,
      true,
      undefined,
      undefined,
      tokenProgram
    )).address;

    takerAtaB = (await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      mintB,
      taker.publicKey,
      true,
      undefined,
      undefined,
      tokenProgram
    )).address;

    const seed = new anchor.BN(1);
    [escrowPDA, escrowBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), maker.publicKey.toBuffer(), seed.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    vault = (await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      mintA,
      escrowPDA,
      true,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    )).address;

    await mintTo(
      connection,
      payer.payer,
      mintA,
      makerAtaA,
      payer.publicKey,
      100n * 10n ** 9n,
      [],
      undefined,
      tokenProgram
    );

    await mintTo(
      connection,
      payer.payer,
      mintB,
      takerAtaB,
      payer.publicKey,
      100n * 10n ** 9n,
      [],
      undefined,
      tokenProgram
    );

    console.log("✅ Setup complete");
  });

  it("Initialize escrow", async () => {
    const seed = new anchor.BN(1);

    await program.methods
      .initialize(seed, new anchor.BN(50 * 10 ** 9), new anchor.BN(30 * 10 ** 9))
      .accounts({
        maker: maker.publicKey,
        mintA,
        mintB,
        makerAtaA,
        escrow: escrowPDA,
        vault,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        tokenProgram,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([maker])
      .rpc();

    console.log("✅ Escrow initialized & deposit complete");
  });

  it("Refund escrow", async () => {
    const seed = new anchor.BN(1);

    await program.methods
      .refund(seed)
      .accounts({
        maker: maker.publicKey,
        mintA,
        mintB,
        makerAtaA,
        escrow: escrowPDA,
        vault,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        tokenProgram,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([maker])
      .rpc();

    console.log("✅ Escrow refunded");
  });

  // Uncomment when `take` function finalized
  //
  // it("Take trade", async () => {
  //   const seed = new anchor.BN(1);
  //   await program.methods
  //     .take(seed)
  //     .accounts({
  //       taker: taker.publicKey,
  //       maker: maker.publicKey,
  //       mintA,
  //       mintB,
  //       makerAtaA,
  //       makerAtaB,
  //       takerAtaA,
  //       takerAtaB,
  //       escrow: escrowPDA,
  //       vault,
  //       associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
  //       tokenProgram,
  //       systemProgram: anchor.web3.SystemProgram.programId
  //     })
  //     .signers([taker])
  //     .rpc();
  //   console.log("✅ Escrow taken (trade completed)");
  // });
});
