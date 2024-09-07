import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import {
  transactionBuilder,
  signerIdentity,
  publicKey,
  generateSigner,
} from "@metaplex-foundation/umi";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { mintV2 } from "@metaplex-foundation/mpl-candy-machine";
import { Keypair, PublicKey } from "@solana/web3.js";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";

const rpcEndpoint = "https://api.mainnet-beta.solana.com";

const signer = Keypair.generate(); // Replace with your own keypair if needed

const umi = createUmi(rpcEndpoint);
const mySigner = generateSigner(umi);

umi.use(signerIdentity(mySigner.publicKey)).use(mplCandyMachine());

async function getMintTransaction({
  candyMachineAddress,
  nftMintAddress,
  collectionMintAddress,
  collectionUpdateAuthorityAddress,
}) {
  try {
    // Validate and log the PublicKeys
    const candyMachinePubKey = publicKey(candyMachineAddress);
    const nftMintPubKey = publicKey(nftMintAddress);
    const collectionMintPubKey = publicKey(collectionMintAddress);
    const collectionUpdateAuthorityPubKey = publicKey(
      collectionUpdateAuthorityAddress
    );

    console.log("Candy Machine PublicKey:", candyMachinePubKey.toString());
    console.log("NFT Mint PublicKey:", nftMintPubKey.toString());
    console.log("Collection Mint PublicKey:", collectionMintPubKey.toString());
    console.log(
      "Collection Update Authority PublicKey:",
      collectionUpdateAuthorityPubKey.toString()
    );

    const builder = transactionBuilder();

    builder.add(setComputeUnitLimit(umi, { units: 800_000 }));

    const mint = mintV2(umi, {
      candyMachine: candyMachinePubKey,
      nftMint: nftMintPubKey,
      collectionMint: collectionMintPubKey,
      collectionUpdateAuthority: collectionUpdateAuthorityPubKey,
      tokenStandard: TokenStandard.ProgrammableNonFungible,
    });
    console.log("Mint tx: ", mint);
    console.log("Mint tx: ", mint.items[0].instruction);

    builder.add(mint);

    console.log("Transaction builder created:", builder);

    // try {
    //   const result = await txBuilder.sendAndConfirm(umi);
    //   console.log("Transaction confirmed:", result);
    // } catch (sendError) {
    //   console.error("Transaction failed:", sendError);
    //   // Additional debugging information
    //   if (sendError instanceof Error) {
    //     console.error("Send Error message:", sendError.message);
    //     console.error("Send Error stack:", sendError.stack);
    //   }
    // }

    console.log("Transaction successful");
  } catch (error) {
    console.error("Detailed error:", JSON.stringify(error));

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack trace:", error.stack);

      if (error.message.includes("Invalid public key")) {
        console.error("One or more of the provided addresses are invalid.");
      }
    } else {
      console.error("An unexpected error occurred:", error);
    }
  }
}

// Test with actual valid addresses
getMintTransaction({
  candyMachineAddress: "7PRo1vgzFubjdUtLWK8MW2bc9Ppceo8huY2x6WtBvmgV",
  nftMintAddress: "4AbFxkiCZW9huFQGcgfhNYCpHEUgY37ZZyzC2u4qdtmi",
  collectionMintAddress: "5xpFLPSCfee2eRtvjFK4v8GUqf54geSwVMmTzW5ehfms",
  collectionUpdateAuthorityAddress:
    "5xpFLPSCfee2eRtvjFK4v8GUqf54geSwVMmTzW5ehfms",
});
