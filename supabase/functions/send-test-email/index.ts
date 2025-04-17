import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// import { createClient } from 'npm:@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, template, data } = await req.json();

    // Email templates
    const templates = {
      'test-passed': {
        subject: 'Congratulations on Passing Your Test!',
        body: `
          Dear ${data.name},

          Congratulations! We're pleased to inform you that you have successfully passed your technical assessment with a score of ${data.score}%.

          This achievement demonstrates your technical proficiency and readiness for professional opportunities in your field.

          You can now apply for positions that match your skill level and expertise.

          Best regards,
          The Aguka Team
        `,
      },
    };

    const selectedTemplate = templates[template];
    if (!selectedTemplate) {
      throw new Error('Invalid email template');
    }

    // Send email using your preferred email service
    // This is a placeholder - implement actual email sending logic
    console.log('Sending email:', {
      to,
      subject: selectedTemplate.subject,
      body: selectedTemplate.body,
    });

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});