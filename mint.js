import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { signerIdentity, transactionBuilder } from "@metaplex-foundation/umi";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { mintV2 } from "@metaplex-foundation/mpl-candy-machine";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import { Keypair, PublicKey } from "@solana/web3.js";

const rpcEndpointDev = "https://api.devnet.solana.com";
const umi = createUmi(rpcEndpointDev);
const signer = Keypair.generate();

umi.use(signerIdentity(signer.publicKey)).use(mplCandyMachine());

async function getMintTransaction({
  candyMachineAddress,
  nftMintAddress,
  collectionMintAddress,
  collectionUpdateAuthorityAddress,
}) {
  try {
    if (
      !validatePublicKey(candyMachineAddress) ||
      !validatePublicKey(nftMintAddress) ||
      !validatePublicKey(collectionMintAddress) ||
      !validatePublicKey(collectionUpdateAuthorityAddress)
    ) {
      throw new Error("One or more public keys are invalid.");
    }

    const candyMachinePubKey = new PublicKey(candyMachineAddress);
    const nftMintPubKey = new PublicKey(nftMintAddress);
    const collectionMintPubKey = new PublicKey(collectionMintAddress);
    const collectionUpdateAuthorityPubKey = new PublicKey(
      collectionUpdateAuthorityAddress
    );

    const txBuilder = transactionBuilder().add(
      setComputeUnitLimit(umi, { units: 800_000 })
    );

    const mint = mintV2(umi, {
      candyMachine: candyMachinePubKey,
      nftMint: nftMintPubKey,
      collectionMint: collectionMintPubKey,
      collectionUpdateAuthority: collectionUpdateAuthorityPubKey,
      tokenStandard: TokenStandard.ProgrammableNonFungible,
    });

    txBuilder.add(mint);

    const instructions = txBuilder.items.flatMap((item) => item.instruction);
    if (instructions.length === 0) {
      throw new Error("The transaction does not contain instructions");
    }

    const transaction = umi.transactions.create({
      version: 0,
      blockhash: (await umi.rpc.getLatestBlockhash()).blockhash,
      instructions: instructions,
      payer: umi.payer.publicKey,
    });

    console.log("Transaction builder created:", transaction);

    return transaction;
  } catch (error) {
    console.error("Detailed error:", error);
    throw error;
  }
}

function validatePublicKey(publicKey) {
  try {
    new PublicKey(publicKey);
    return true;
  } catch {
    return false;
  }
}

// Example usage
getMintTransaction({
  candyMachineAddress: "7PRo1vgzFubjdUtLWK8MW2bc9Ppceo8huY2x6WtBvmgV",
  nftMintAddress: "4AbFxkiCZW9huFQGcgfhNYCpHEUgY37ZZyzC2u4qdtmi",
  collectionMintAddress: "5xpFLPSCfee2eRtvjFK4v8GUqf54geSwVMmTzW5ehfms",
  collectionUpdateAuthorityAddress:
    "5xpFLPSCfee2eRtvjFK4v8GUqf54geSwVMmTzW5ehfms",
});
