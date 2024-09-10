import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import {
  transactionBuilder,
  signerIdentity,
  signerPayer,
  publicKey,
  createSignerFromKeypair,
} from "@metaplex-foundation/umi";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { mintV2 } from "@metaplex-foundation/mpl-candy-machine";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";

const rpcEndpoint = "https://api.devnet.solana.com";

let signer = {
  secretKey: Uint8Array.from([
    229, 242, 102, 34, 251, 222, 25, 17, 214, 226, 11, 5, 217, 77, 251, 167,
    148, 136, 88, 167, 32, 205, 213, 183, 35, 67, 34, 48, 235, 94, 8, 29, 152,
    73, 15, 65, 124, 151, 148, 108, 7, 243, 83, 36, 25, 244, 118, 175, 33, 145,
    230, 56, 130, 119, 68, 58, 98, 152, 41, 83, 68, 11, 53, 122,
  ]),
  publicKey: "BFTathbmoN74NEDnxbKbh8KNs7SahtxkKsDU9Ca69vzm",
};
console.log("sig: ", signer.secretKey);
const umi = createUmi(rpcEndpoint);
const mySigner = createSignerFromKeypair(umi, signer);

umi
  .use(signerPayer(mySigner))
  .use(signerIdentity(mySigner))
  .use(mplCandyMachine());

async function getMintTransaction({
  candyMachineAddress,
  nftMintAddress,
  collectionMintAddress,
  collectionUpdateAuthorityAddress,
}) {
  try {
    const candyMachinePubKey = publicKey(candyMachineAddress);
    const nftMintPubKey = publicKey(nftMintAddress);
    const collectionMintPubKey = publicKey(collectionMintAddress);
    const collectionUpdateAuthorityPubKey = publicKey(
      collectionUpdateAuthorityAddress
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

    let res = await mint.sendAndConfirm(umi);
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

getMintTransaction({
  candyMachineAddress: "7PRo1vgzFubjdUtLWK8MW2bc9Ppceo8huY2x6WtBvmgV",
  nftMintAddress: "4AbFxkiCZW9huFQGcgfhNYCpHEUgY37ZZyzC2u4qdtmi",
  collectionMintAddress: "5xpFLPSCfee2eRtvjFK4v8GUqf54geSwVMmTzW5ehfms",
  collectionUpdateAuthorityAddress:
    "5xpFLPSCfee2eRtvjFK4v8GUqf54geSwVMmTzW5ehfms",
});
