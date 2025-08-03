import type { SIWEConfig, SIWESession } from '@web3modal/core';
import { Web3ModalSIWEClient } from '../src/client.js';
export type { Web3ModalSIWEClient, SIWEConfig, SIWESession };
export declare function createSIWEConfig(siweConfig: SIWEConfig): Web3ModalSIWEClient;
