import { describe, test, expect, beforeEach } from 'vitest';

// Simulated contract state
let bounties: any[] = [];
let nextBountyId = 0;

// Helper functions to simulate contract calls
const simulateContractCall = (functionName: string, args: any[], sender: string) => {
  if (functionName === 'create-bounty') {
    const [title, description, amount] = args;
    const bountyId = nextBountyId++;
    bounties.push({ id: bountyId, title, description, amount, status: "open", claimer: null });
    return { success: true, value: bountyId };
  }
  if (functionName === 'claim-bounty') {
    const [bountyId] = args;
    const bounty = bounties.find(b => b.id === bountyId);
    if (bounty && bounty.status === "open") {
      bounty.status = "claimed";
      bounty.claimer = sender;
      return { success: true, value: true };
    }
    return { success: false, error: bounty ? 'Bounty already claimed' : 'Bounty not found' };
  }
  if (functionName === 'get-bounty') {
    const [bountyId] = args;
    const bounty = bounties.find(b => b.id === bountyId);
    return bounty ? { success: true, value: bounty } : { success: false, error: 'Bounty not found' };
  }
  return { success: false, error: 'Function not found' };
};

describe('Bounty Manager Contract', () => {
  const deployer = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const user1 = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  
  beforeEach(() => {
    bounties = [];
    nextBountyId = 0;
  });
  
  test('users can create bounties', () => {
    const result = simulateContractCall(
        'create-bounty',
        ["Find vulnerability", "Find a vulnerability in the test algorithm", 1000],
        deployer
    );
    
    expect(result.success).toBe(true);
    expect(result.value).toBe(0);
    
    const bountyResult = simulateContractCall('get-bounty', [0], deployer);
    expect(bountyResult.success).toBe(true);
    expect(bountyResult.value).toEqual({
      id: 0,
      title: "Find vulnerability",
      description: "Find a vulnerability in the test algorithm",
      amount: 1000,
      status: "open",
      claimer: null
    });
  });
  
  test('users can claim bounties', () => {
    // First create a bounty
    simulateContractCall(
        'create-bounty',
        ["Find vulnerability", "Find a vulnerability in the test algorithm", 1000],
        deployer
    );
    
    // Then claim it
    const claimResult = simulateContractCall(
        'claim-bounty',
        [0],
        user1
    );
    
    expect(claimResult.success).toBe(true);
    expect(claimResult.value).toBe(true);
    
    // Check bounty details
    const bountyResult = simulateContractCall(
        'get-bounty',
        [0],
        deployer
    );
    
    expect(bountyResult.success).toBe(true);
    expect(bountyResult.value.status).toBe('claimed');
    expect(bountyResult.value.claimer).toBe(user1);
  });
  
  test('claiming already claimed bounty fails', () => {
    // Create and claim a bounty
    simulateContractCall(
        'create-bounty',
        ["Find vulnerability", "Find a vulnerability in the test algorithm", 1000],
        deployer
    );
    simulateContractCall('claim-bounty', [0], user1);
    
    // Try to claim it again
    const claimResult = simulateContractCall(
        'claim-bounty',
        [0],
        deployer
    );
    
    expect(claimResult.success).toBe(false);
    expect(claimResult.error).toBe('Bounty already claimed');
  });
});

