// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
const circom = require("circom");
const snarkjs = require("snarkjs");
const snarkBigInt = require("snarkjs/src/stringifybigint");
const fs = require("fs");
const path = require("path");
const solc = require("solc");

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

exports.generateAndDeployVerifier = functions.https.onCall(
  async (data, context) => {
    let response = {};
    // use circom library to generate circuit.json in Firebase storage of the Quest

    fs.writeFileSync("/tmp/circuit.circom", data, "utf8");

    const fullFileName = path.resolve("/tmp", "./circuit.circom");

    const cir = await circom(fullFileName);
    fs.writeFileSync("/tmp/circuit.json", JSON.stringify(cir, null, 1), "utf8");

    // use snarkjs library to do the setup and save proving_key.json and verification_key.json in Firebase storage of the Quest

    const cirDef = JSON.parse(fs.readFileSync("/tmp/circuit.json", "utf8"));
    response.cirDef = cirDef;

    circuit = new snarkjs.Circuit(cirDef);

    const setup = await snarkjs.original.setup(circuit);
    await fs.writeFileSync(
      "/tmp/proving_key.json",
      JSON.stringify(snarkBigInt.stringifyBigInts(setup.vk_proof), null, 1),
      "utf-8"
    );

    response.provingKeyRaw = fs.readFileSync("/tmp/proving_key.json", "utf8");
    response.provingKeyUnstring = snarkBigInt.unstringifyBigInts(
      JSON.parse(fs.readFileSync("/tmp/proving_key.json", "utf8"))
    );

    await fs.writeFileSync(
      "/tmp/verification_key.json",
      JSON.stringify(snarkBigInt.stringifyBigInts(setup.vk_verifier), null, 1),
      "utf-8"
    );

    response.verificationKeyRaw = fs.readFileSync(
      "/tmp/verification_key.json",
      "utf8"
    );
    response.verificationKeyUnstring = snarkBigInt.unstringifyBigInts(
      JSON.parse(fs.readFileSync("/tmp/verification_key.json", "utf8"))
    );

    // use snarkjs library to generateverifier from verification_key.json and save verifier.sol in Firebase storage of the Quest

    const vk_proof = fs.readFileSync("/tmp/proving_key.json", "utf8");

    response.provingKey = vk_proof;

    const vk_verifier = await snarkBigInt.unstringifyBigInts(
      JSON.parse(fs.readFileSync("/tmp/verification_key.json", "utf8"))
    );

    response.verificationKey = fs.readFileSync(
      "/tmp/verification_key.json",
      "utf8"
    );

    function generateVerifier_original(verificationKey) {
      let template = `//
      // Copyright 2017 Christian Reitwiessner
      // Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
      // The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
      // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
      pragma solidity ^0.4.17;
      library Pairing {
          struct G1Point {
              uint X;
              uint Y;
          }
          // Encoding of field elements is: X[0] * z + X[1]
          struct G2Point {
              uint[2] X;
              uint[2] Y;
          }
          /// @return the generator of G1
          function P1() pure internal returns (G1Point) {
              return G1Point(1, 2);
          }
          /// @return the generator of G2
          function P2() pure internal returns (G2Point) {
              // Original code point
              return G2Point(
                  [11559732032986387107991004021392285783925812861821192530917403151452391805634,
                   10857046999023057135944570762232829481370756359578518086990519993285655852781],
                  [4082367875863433681332203403145435568316851327593401208105741076214120093531,
                   8495653923123431417604973247489272438418190587263600148770280649306958101930]
              );
      
      /*
              // Changed by Jordi point
              return G2Point(
                  [10857046999023057135944570762232829481370756359578518086990519993285655852781,
                   11559732032986387107991004021392285783925812861821192530917403151452391805634],
                  [8495653923123431417604973247489272438418190587263600148770280649306958101930,
                   4082367875863433681332203403145435568316851327593401208105741076214120093531]
              );
      */
          }
          /// @return the negation of p, i.e. p.addition(p.negate()) should be zero.
          function negate(G1Point p) pure internal returns (G1Point) {
              // The prime q in the base field F_q for G1
              uint q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
              if (p.X == 0 && p.Y == 0)
                  return G1Point(0, 0);
              return G1Point(p.X, q - (p.Y % q));
          }
          /// @return the sum of two points of G1
          function addition(G1Point p1, G1Point p2) view internal returns (G1Point r) {
              uint[4] memory input;
              input[0] = p1.X;
              input[1] = p1.Y;
              input[2] = p2.X;
              input[3] = p2.Y;
              bool success;
              assembly {
                  success := staticcall(sub(gas, 2000), 6, input, 0xc0, r, 0x60)
                  // Use "invalid" to make gas estimation work
                  switch success case 0 { invalid() }
              }
              require(success);
          }
          /// @return the product of a point on G1 and a scalar, i.e.
          /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
          function scalar_mul(G1Point p, uint s) view internal returns (G1Point r) {
              uint[3] memory input;
              input[0] = p.X;
              input[1] = p.Y;
              input[2] = s;
              bool success;
              assembly {
                  success := staticcall(sub(gas, 2000), 7, input, 0x80, r, 0x60)
                  // Use "invalid" to make gas estimation work
                  switch success case 0 { invalid() }
              }
              require (success);
          }
          /// @return the result of computing the pairing check
          /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
          /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
          /// return true.
          function pairing(G1Point[] p1, G2Point[] p2) view internal returns (bool) {
              require(p1.length == p2.length);
              uint elements = p1.length;
              uint inputSize = elements * 6;
              uint[] memory input = new uint[](inputSize);
              for (uint i = 0; i < elements; i++)
              {
                  input[i * 6 + 0] = p1[i].X;
                  input[i * 6 + 1] = p1[i].Y;
                  input[i * 6 + 2] = p2[i].X[0];
                  input[i * 6 + 3] = p2[i].X[1];
                  input[i * 6 + 4] = p2[i].Y[0];
                  input[i * 6 + 5] = p2[i].Y[1];
              }
              uint[1] memory out;
              bool success;
              assembly {
                  success := staticcall(sub(gas, 2000), 8, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
                  // Use "invalid" to make gas estimation work
                  switch success case 0 { invalid() }
              }
              require(success);
              return out[0] != 0;
          }
          /// Convenience method for a pairing check for two pairs.
          function pairingProd2(G1Point a1, G2Point a2, G1Point b1, G2Point b2) view internal returns (bool) {
              G1Point[] memory p1 = new G1Point[](2);
              G2Point[] memory p2 = new G2Point[](2);
              p1[0] = a1;
              p1[1] = b1;
              p2[0] = a2;
              p2[1] = b2;
              return pairing(p1, p2);
          }
          /// Convenience method for a pairing check for three pairs.
          function pairingProd3(
                  G1Point a1, G2Point a2,
                  G1Point b1, G2Point b2,
                  G1Point c1, G2Point c2
          ) view internal returns (bool) {
              G1Point[] memory p1 = new G1Point[](3);
              G2Point[] memory p2 = new G2Point[](3);
              p1[0] = a1;
              p1[1] = b1;
              p1[2] = c1;
              p2[0] = a2;
              p2[1] = b2;
              p2[2] = c2;
              return pairing(p1, p2);
          }
          /// Convenience method for a pairing check for four pairs.
          function pairingProd4(
                  G1Point a1, G2Point a2,
                  G1Point b1, G2Point b2,
                  G1Point c1, G2Point c2,
                  G1Point d1, G2Point d2
          ) view internal returns (bool) {
              G1Point[] memory p1 = new G1Point[](4);
              G2Point[] memory p2 = new G2Point[](4);
              p1[0] = a1;
              p1[1] = b1;
              p1[2] = c1;
              p1[3] = d1;
              p2[0] = a2;
              p2[1] = b2;
              p2[2] = c2;
              p2[3] = d2;
              return pairing(p1, p2);
          }
      }
      contract Verifier {
          using Pairing for *;
          struct VerifyingKey {
              Pairing.G2Point A;
              Pairing.G1Point B;
              Pairing.G2Point C;
              Pairing.G2Point gamma;
              Pairing.G1Point gammaBeta1;
              Pairing.G2Point gammaBeta2;
              Pairing.G2Point Z;
              Pairing.G1Point[] IC;
          }
          struct Proof {
              Pairing.G1Point A;
              Pairing.G1Point A_p;
              Pairing.G2Point B;
              Pairing.G1Point B_p;
              Pairing.G1Point C;
              Pairing.G1Point C_p;
              Pairing.G1Point K;
              Pairing.G1Point H;
          }
          function verifyingKey() pure internal returns (VerifyingKey vk) {
              vk.A = Pairing.G2Point(<%vk_a%>);
              vk.B = Pairing.G1Point(<%vk_b%>);
              vk.C = Pairing.G2Point(<%vk_c%>);
              vk.gamma = Pairing.G2Point(<%vk_g%>);
              vk.gammaBeta1 = Pairing.G1Point(<%vk_gb1%>);
              vk.gammaBeta2 = Pairing.G2Point(<%vk_gb2%>);
              vk.Z = Pairing.G2Point(<%vk_z%>);
              vk.IC = new Pairing.G1Point[](<%vk_ic_length%>);
              <%vk_ic_pts%>
          }
          function verify(uint[] input, Proof proof) view internal returns (uint) {
              VerifyingKey memory vk = verifyingKey();
              require(input.length + 1 == vk.IC.length);
              // Compute the linear combination vk_x
              Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
              for (uint i = 0; i < input.length; i++)
                  vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.IC[i + 1], input[i]));
              vk_x = Pairing.addition(vk_x, vk.IC[0]);
              if (!Pairing.pairingProd2(proof.A, vk.A, Pairing.negate(proof.A_p), Pairing.P2())) return 1;
              if (!Pairing.pairingProd2(vk.B, proof.B, Pairing.negate(proof.B_p), Pairing.P2())) return 2;
              if (!Pairing.pairingProd2(proof.C, vk.C, Pairing.negate(proof.C_p), Pairing.P2())) return 3;
              if (!Pairing.pairingProd3(
                  proof.K, vk.gamma,
                  Pairing.negate(Pairing.addition(vk_x, Pairing.addition(proof.A, proof.C))), vk.gammaBeta2,
                  Pairing.negate(vk.gammaBeta1), proof.B
              )) return 4;
              if (!Pairing.pairingProd3(
                      Pairing.addition(vk_x, proof.A), proof.B,
                      Pairing.negate(proof.H), vk.Z,
                      Pairing.negate(proof.C), Pairing.P2()
              )) return 5;
              return 0;
          }
          function verifyProof(
                  uint[2] a,
                  uint[2] a_p,
                  uint[2][2] b,
                  uint[2] b_p,
                  uint[2] c,
                  uint[2] c_p,
                  uint[2] h,
                  uint[2] k,
                  uint[<%vk_input_length%>] input
              ) view public returns (bool r) {
              Proof memory proof;
              proof.A = Pairing.G1Point(a[0], a[1]);
              proof.A_p = Pairing.G1Point(a_p[0], a_p[1]);
              proof.B = Pairing.G2Point([b[0][0], b[0][1]], [b[1][0], b[1][1]]);
              proof.B_p = Pairing.G1Point(b_p[0], b_p[1]);
              proof.C = Pairing.G1Point(c[0], c[1]);
              proof.C_p = Pairing.G1Point(c_p[0], c_p[1]);
              proof.H = Pairing.G1Point(h[0], h[1]);
              proof.K = Pairing.G1Point(k[0], k[1]);
              uint[] memory inputValues = new uint[](input.length);
              for(uint i = 0; i < input.length; i++){
                  inputValues[i] = input[i];
              }
              if (verify(inputValues, proof) == 0) {
                  return true;
              } else {
                  return false;
              }
          }
      }`;

      const vka_str =
        `[${verificationKey.vk_a[0][1].toString()},` +
        `${verificationKey.vk_a[0][0].toString()}], ` +
        `[${verificationKey.vk_a[1][1].toString()},` +
        `${verificationKey.vk_a[1][0].toString()}]`;
      template = template.replace("<%vk_a%>", vka_str);

      const vkb_str =
        `${verificationKey.vk_b[0].toString()},` +
        `${verificationKey.vk_b[1].toString()}`;
      template = template.replace("<%vk_b%>", vkb_str);

      const vkc_str =
        `[${verificationKey.vk_c[0][1].toString()},` +
        `${verificationKey.vk_c[0][0].toString()}], ` +
        `[${verificationKey.vk_c[1][1].toString()},` +
        `${verificationKey.vk_c[1][0].toString()}]`;
      template = template.replace("<%vk_c%>", vkc_str);

      const vkg_str =
        `[${verificationKey.vk_g[0][1].toString()},` +
        `${verificationKey.vk_g[0][0].toString()}], ` +
        `[${verificationKey.vk_g[1][1].toString()},` +
        `${verificationKey.vk_g[1][0].toString()}]`;
      template = template.replace("<%vk_g%>", vkg_str);

      const vkgb1_str =
        `${verificationKey.vk_gb_1[0].toString()},` +
        `${verificationKey.vk_gb_1[1].toString()}`;
      template = template.replace("<%vk_gb1%>", vkgb1_str);

      const vkgb2_str =
        `[${verificationKey.vk_gb_2[0][1].toString()},` +
        `${verificationKey.vk_gb_2[0][0].toString()}], ` +
        `[${verificationKey.vk_gb_2[1][1].toString()},` +
        `${verificationKey.vk_gb_2[1][0].toString()}]`;
      template = template.replace("<%vk_gb2%>", vkgb2_str);

      const vkz_str =
        `[${verificationKey.vk_z[0][1].toString()},` +
        `${verificationKey.vk_z[0][0].toString()}], ` +
        `[${verificationKey.vk_z[1][1].toString()},` +
        `${verificationKey.vk_z[1][0].toString()}]`;
      template = template.replace("<%vk_z%>", vkz_str);

      // The points

      template = template.replace(
        "<%vk_input_length%>",
        (verificationKey.IC.length - 1).toString()
      );
      template = template.replace(
        "<%vk_ic_length%>",
        verificationKey.IC.length.toString()
      );
      let vi = "";
      for (let i = 0; i < verificationKey.IC.length; i++) {
        if (vi !== "") vi = vi + "        ";
        vi =
          vi +
          `vk.IC[${i}] = Pairing.G1Point(${verificationKey.IC[
            i
          ][0].toString()},` +
          `${verificationKey.IC[i][1].toString()});\n`;
      }
      template = template.replace("<%vk_ic_pts%>", vi);

      return template;
    }

    let verifierCode = await generateVerifier_original(vk_verifier);

    response.verifierCode = verifierCode;

    return response;
  }
);

exports.deployVerifierContract = functions.https.onCall(
  async (data, context) => {
    // compile verifier.sol

    let sourceFile = await fs.writeFileSync("/tmp/verifier.sol", data, "utf-8");
    const source = await fs.readFileSync("/tmp/verifier.sol", "utf8");

    const compilation = await solc.compile(source, 1).contracts[":Verifier"];

    return compilation;
  }
);

exports.generateInputProofAndVerify = functions.https.onCall(
  async (data, context) => {
    let response = {};

    // generate input.json from user input

    await fs.writeFileSync("/tmp/input.json", data.inputJSON, "utf8");

    // use snarkjs library to calculate the witness from input.json and circuit.circom and save witness.json in Firebase storage of the Quest

    let inputJSON = await fs.readFileSync("/tmp/input.json", "utf8");
    let parsedInputJSON = JSON.parse(inputJSON);

    const cir = new snarkjs.Circuit(data.cirDef);
    const input = snarkBigInt.unstringifyBigInts(parsedInputJSON);

    let witness;

    try {
      witness = cir.calculateWitness(input);
    } catch (err) {
      response.message = "Path does not respect constraints !";
      return response;
    }

    await fs.writeFileSync(
      "/tmp/witness.json",
      JSON.stringify(snarkBigInt.stringifyBigInts(witness), null, 1),
      "utf-8"
    );

    // use snarkjs library to create the proof from witness.json and proving_key.json and save proof.json and public.json in Firebase storage of the Quest

    const witnessJSON = snarkBigInt.unstringifyBigInts(
      JSON.parse(fs.readFileSync("/tmp/witness.json", "utf8"))
    );

    await fs.writeFileSync("/tmp/proving_key.json", data.provingKey, "utf-8");

    const provingKey = snarkBigInt.unstringifyBigInts(
      JSON.parse(fs.readFileSync("/tmp/proving_key.json", "utf8"))
    );

    const protocol = provingKey.protocol;
    if (!snarkjs[protocol]) throw new Error("Invalid protocol");

    const { proof, publicSignals } = snarkjs[protocol].genProof(
      provingKey,
      witnessJSON
    );

    await fs.writeFileSync(
      "/tmp/proof.json",
      JSON.stringify(snarkBigInt.stringifyBigInts(proof), null, 1),
      "utf-8"
    );
    const proofJSONresponse = fs.readFileSync("/tmp/proof.json", "utf8");
    response.proofJSONresponse = proofJSONresponse;

    await fs.writeFileSync(
      "/tmp/public.json",
      JSON.stringify(snarkBigInt.stringifyBigInts(publicSignals), null, 1),
      "utf-8"
    );
    const publicJSONresponse = fs.readFileSync("/tmp/public.json", "utf8");
    response.publicJSONresponse = publicJSONresponse;

    // run verification via snarkjs verify from verification_key.json, proof.json and public.json and do a window.alert with the result

    await fs.writeFileSync(
      "/tmp/verification_key.json",
      data.verificationKey,
      "utf-8"
    );

    const publicJSON = snarkBigInt.unstringifyBigInts(
      JSON.parse(fs.readFileSync("/tmp/public.json", "utf8"))
    );
    const verificationKey = snarkBigInt.unstringifyBigInts(
      JSON.parse(fs.readFileSync("/tmp/verification_key.json", "utf8"))
    );
    const proofJSON = snarkBigInt.unstringifyBigInts(
      JSON.parse(fs.readFileSync("/tmp/proof.json", "utf8"))
    );

    const protocolVK = verificationKey.protocol;
    if (!snarkjs[protocolVK]) throw new Error("Invalid protocol");

    const isValid = snarkjs[protocolVK].isValid(
      verificationKey,
      proofJSON,
      publicJSON
    );

    if (isValid) {
      response.message = "Path chosen is correct !";
    } else {
      response.message = "Path chosen is incorrect !";
    }

    return response;
  }
);

exports.testVerifierContract = functions.https.onCall(async (data, context) => {
  // use snarkjs library to generate call

  await fs.writeFileSync("/tmp/public.json", data.publicJSONresponse, "utf-8");

  await fs.writeFileSync("/tmp/proof.json", data.proofJSONresponse, "utf-8");

  const publicV = snarkBigInt.unstringifyBigInts(
    JSON.parse(fs.readFileSync("/tmp/public.json", "utf8"))
  );
  const proof = snarkBigInt.unstringifyBigInts(
    JSON.parse(fs.readFileSync("/tmp/proof.json", "utf8"))
  );

  console.log(proof);

  const p256 = function(n) {
    let nstr = n.toString(16);
    while (nstr.length < 64) nstr = "0" + nstr;
    nstr = `"0x${nstr}"`;
    return nstr;
  };

  let inputs = "";
  for (let i = 0; i < publicV.length; i++) {
    if (inputs != "") inputs = inputs + ",";
    inputs = inputs + p256(publicV[i]);
  }

  let S;
  if (typeof proof.protocol === "undefined" || proof.protocol == "original") {
    S =
      `[${p256(proof.pi_a[0])}, ${p256(proof.pi_a[1])}],` +
      `[${p256(proof.pi_ap[0])}, ${p256(proof.pi_ap[1])}],` +
      `[[${p256(proof.pi_b[0][1])}, ${p256(proof.pi_b[0][0])}],[${p256(
        proof.pi_b[1][1]
      )}, ${p256(proof.pi_b[1][0])}]],` +
      `[${p256(proof.pi_bp[0])}, ${p256(proof.pi_bp[1])}],` +
      `[${p256(proof.pi_c[0])}, ${p256(proof.pi_c[1])}],` +
      `[${p256(proof.pi_cp[0])}, ${p256(proof.pi_cp[1])}],` +
      `[${p256(proof.pi_h[0])}, ${p256(proof.pi_h[1])}],` +
      `[${p256(proof.pi_kp[0])}, ${p256(proof.pi_kp[1])}],` +
      `[${inputs}]`;
  } else if (proof.protocol == "groth" || proof.protocol == "kimleeoh") {
    S =
      `[${p256(proof.pi_a[0])}, ${p256(proof.pi_a[1])}],` +
      `[[${p256(proof.pi_b[0][1])}, ${p256(proof.pi_b[0][0])}],[${p256(
        proof.pi_b[1][1]
      )}, ${p256(proof.pi_b[1][0])}]],` +
      `[${p256(proof.pi_c[0])}, ${p256(proof.pi_c[1])}],` +
      `[${inputs}]`;
  } else {
    throw new Error("InvalidProof");
  }

  return S;
});
