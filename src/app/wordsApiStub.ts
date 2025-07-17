export async function fetchWordsStub(query: string): Promise<string[]> {
  // Simulate API delay
  await new Promise(res => setTimeout(res, 500));
  // Return placeholder data
  return ["stub1", "stub2", "stub3"];
} 