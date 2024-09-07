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

async function getTransactionInfo(signature) {
  try {
    const info = await umi.connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!info) {
      throw new Error("Transaction not found");
    }

    return;
  } catch (error) {
    console.error("Error getting transaction info:", error);
    throw error;
  }
}

async function createMintTransaction(
  candyMachineAddress,
  nftMintAddress,
  collectionMintAddress,
  collectionUpdateAuthorityAddress
) {
  try {
    const tx = await transactionBuilder()
      .add(setComputeUnitLimit(umi, { units: 800_000 }))
      .add(
        mintV2(umi, {
          candyMachine: new PublicKey(candyMachineAddress),
          nftMint: new PublicKey(nftMintAddress),
          collectionMint: new PublicKey(collectionMintAddress),
          collectionUpdateAuthority: new PublicKey(
            collectionUpdateAuthorityAddress
          ),
          tokenStandard: TokenStandard.ProgrammableNonFungible,
        })
      );

    const signature = await tx.sendAndConfirm(umi);

    const transactionInfo = await getTransactionInfo(signature);

    return transactionInfo;
  } catch (error) {
    console.error("Detailed error:", JSON.stringify(error));

    if (error instanceof Error && error.stack) {
      console.error("Stack trace:", error.stack);
    }
  }
}
export { createMintTransaction, getTransactionInfo };
