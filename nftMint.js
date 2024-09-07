import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { transactionBuilder, signerIdentity } from "@metaplex-foundation/umi";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { mintV2 } from "@metaplex-foundation/mpl-candy-machine";
import { Keypair, PublicKey } from "@solana/web3.js";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";

const rpcEndpoint = "https://api.mainnet-beta.solana.com";

const signer = Keypair.generate();

const umi = createUmi(rpcEndpoint)
  .use(signerIdentity(signer))
  .use(mplCandyMachine());

async function getMintTransaction(
  candyMachineAddress,
  nftMintAddress,
  collectionMintAddress,
  collectionUpdateAuthorityAddress
) {
  try {
    if (
      typeof candyMachineAddress !== "string" ||
      typeof nftMintAddress !== "string" ||
      typeof collectionMintAddress !== "string" ||
      typeof collectionUpdateAuthorityAddress !== "string"
    ) {
      throw new Error("All input parameters must be strings");
    }

    const publicKeyObjects = [
      new PublicKey(candyMachineAddress),
      new PublicKey(nftMintAddress),
      new PublicKey(collectionMintAddress),
      new PublicKey(collectionUpdateAuthorityAddress),
    ];

    await transactionBuilder()
      .add(setComputeUnitLimit(umi, { units: 800_000 }))
      .add(
        mintV2(umi, {
          candyMachine: publicKeyObjects[0].toBase58(),
          nftMint: publicKeyObjects[1].toBase58(),
          collectionMint: publicKeyObjects[2].toBase58(),
          collectionUpdateAuthority: publicKeyObjects[3].toBase58(),
          tokenStandard: TokenStandard.ProgrammableNonFungible,
        })
      )
      .sendAndConfirm(umi);
  } catch (error) {
    console.error("Detailed error:", JSON.stringify(error));

    if (error instanceof Error && error.stack) {
      console.error("Stack trace:", error.stack);
    }
  }
}

getMintTransaction(
  "7PRo1vgzFubjdUtLWK8MW2bc9Ppceo8huY2x6WtBvmgV",
  "4AbFxkiCZW9huFQGcgfhNYCpHEUgY37ZZyzC2u4qdtmi",
  "5xpFLPSCfee2eRtvjFK4v8GUqf54geSwVMmTzW5ehfms",
  "5xpFLPSCfee2eRtvjFK4v8GUqf54geSwVMmTzW5ehfms"
);
