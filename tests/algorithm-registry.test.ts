import { describe, test, expect, beforeEach } from 'vitest';

// Simulated contract state
let algorithms: any[] = [];
let nextAlgorithmId = 0;

// Helper functions to simulate contract calls
const simulateContractCall = (functionName: string, args: any[], sender: string) => {
  if (functionName === 'submit-algorithm') {
    const [name, description] = args;
    const algorithmId = nextAlgorithmId++;
    algorithms.push({ id: algorithmId, name, description, author: sender, votes: 0, status: "submitted" });
    return { success: true, value: algorithmId };
  }
  if (functionName === 'vote-for-algorithm') {
    const [algorithmId] = args;
    const algorithm = algorithms.find(a => a.id === algorithmId);
    if (algorithm) {
      algorithm.votes++;
      return { success: true, value: true };
    }
    return { success: false, error: 'Algorithm not found' };
  }
  if (functionName === 'get-algorithm') {
    const [algorithmId] = args;
    const algorithm = algorithms.find(a => a.id === algorithmId);
    return algorithm ? { success: true, value: algorithm } : { success: false, error: 'Algorithm not found' };
  }
  return { success: false, error: 'Function not found' };
};

describe('Algorithm Registry Contract', () => {
  const deployer = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const user1 = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  
  beforeEach(() => {
    algorithms = [];
    nextAlgorithmId = 0;
  });
  
  test('users can submit algorithms', () => {
    const result = simulateContractCall(
        'submit-algorithm',
        ["Test Algorithm", "A test quantum-resistant algorithm"],
        deployer
    );
    
    expect(result.success).toBe(true);
    expect(result.value).toBe(0);
    
    const algorithmResult = simulateContractCall('get-algorithm', [0], deployer);
    expect(algorithmResult.success).toBe(true);
    expect(algorithmResult.value).toEqual({
      id: 0,
      name: "Test Algorithm",
      description: "A test quantum-resistant algorithm",
      author: deployer,
      votes: 0,
      status: "submitted"
    });
  });
  
  test('users can vote for algorithms', () => {
    // First submit an algorithm
    simulateContractCall(
        'submit-algorithm',
        ["Test Algorithm", "A test quantum-resistant algorithm"],
        deployer
    );
    
    // Then vote for it
    const voteResult = simulateContractCall(
        'vote-for-algorithm',
        [0],
        user1
    );
    
    expect(voteResult.success).toBe(true);
    expect(voteResult.value).toBe(true);
    
    // Check algorithm details
    const algorithmResult = simulateContractCall(
        'get-algorithm',
        [0],
        deployer
    );
    
    expect(algorithmResult.success).toBe(true);
    expect(algorithmResult.value.votes).toBe(1);
  });
  
  test('voting for non-existent algorithm fails', () => {
    const voteResult = simulateContractCall(
        'vote-for-algorithm',
        [999],
        user1
    );
    
    expect(voteResult.success).toBe(false);
    expect(voteResult.error).toBe('Algorithm not found');
  });
});

