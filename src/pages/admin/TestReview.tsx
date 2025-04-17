// Update the handleApprove function in TestReview.tsx

// const handleApprove = async () => {
//   try {
//     const score = calculateTotalScore();
//     const passed = score >= 70;

//     const { error: updateError } = await supabase
//       .from('test_sessions')
//       .update({
//         review_status: passed ? 'passed' : 'failed',
//         score,
//         reviewed_by: user?.id,
//         reviewed_at: new Date().toISOString(),
//       })
//       .eq('id', id);

//     if (updateError) throw updateError;

//     if (passed) {
//       // Send congratulations email
//       const { error: emailError } = await supabase.functions.invoke('send-test-email', {
//         body: {
//           to: session?.candidate.email,
//           template: 'test-passed',
//           data: {
//             name: session?.candidate.full_name,
//             score,
//           },
//         },
//       });

//       if (emailError) throw emailError;
//     }

//     toast({
//       title: 'Success',
//       description: `Test ${passed ? 'approved' : 'failed'}. ${
//         passed ? 'Candidate is now marked as talent.' : ''
//       }`,
//     });

//     // Refresh the page to show updated status
//     fetchTestDetails();
//   } catch (error: any) {
//     toast({
//       variant: 'destructive',
//       title: 'Error',
//       description: error.message,
//     });
//   }
// };

export default function TestReview() {
  return (
    <div className="h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">Test Review</h1>
      <p className="text-base text-neutral-500">Coming soon...</p>
    </div>
  );
}