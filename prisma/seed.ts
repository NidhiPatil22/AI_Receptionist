import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Check if demo business already exists to prevent destructive overwrites
  const existingDemo = await prisma.business.findFirst({
    where: { name: 'Bloom Dental Studio' }
  });

  if (existingDemo) {
    console.log('ℹ️ Demo business "Bloom Dental Studio" already exists. Skipping seed to protect tenant data.');
    return;
  }

  // 2. Seed Business
  const business = await prisma.business.create({
    data: {
      name: 'Bloom Dental Studio',
      description: 'A boutique dental studio focusing on gentle, aesthetic care in a calming, friendly space. We specialize in general dentistry, cosmetic styling, whitening, and emergency care.',
      phone: '+1 (555) 010-2020',
      email: 'hello@bloomdental.studio',
      website: 'www.bloomdental.studio',
      address: '123 Main Street, Suite 100, Sparkle City',
      industry: 'Healthcare / Dental',
      services: 'Dental Cleaning, Teeth Whitening, Dental Consultation, Emergency Dental Care, Porcelain Veneers, Invisalign',
      pricing: 'Dental cleaning: $150, Teeth whitening: $399, Consultation: $99, Emergency visit: $250. We accept all major PPO insurance plans.',
    },
  });

  console.log('🏢 Seeded business:', business.name);

  // 3. Seed Admin User (password is "bloom123", hashed using bcrypt rounds 10)
  const passwordHash = '$2a$10$R0d8zGZ8c4V.aE6F22eNTe16P8iH8K.m/N4v385Q6Qp9Dq77h1L76';
  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Bloom',
      email: 'admin@bloomdental.studio',
      password: passwordHash,
      businessId: business.id,
    },
  });

  console.log('👤 Seeded admin user:', admin.email);

  // 4. Seed FAQs
  const faqsData = [
    { question: 'What are your opening hours?', answer: 'We are open Monday to Friday from 9 AM to 6 PM, and Saturday from 10 AM to 2 PM. We are closed on Sundays.', category: 'Hours' },
    { question: 'Where are you located?', answer: 'We are located at 123 Main Street, Suite 100, Sparkle City. Free parking is available in the private lot at the back of our clinic.', category: 'Location' },
    { question: 'Do you accept appointments?', answer: 'Yes! We highly recommend booking in advance. You can book directly on our website, test our AI receptionist call assistant, or shoot us a message here.', category: 'Services' },
    { question: 'Do you accept dental insurance?', answer: 'Yes, we accept all major PPO insurance plans (e.g., Delta Dental, Aetna, Cigna, MetLife). We can verify your dental benefits prior to your first appointment.', category: 'Pricing' },
    { question: 'How much does professional teeth whitening cost?', answer: 'Our in-office whitening is $399. We also offer custom take-home whitening trays for $199.', category: 'Pricing' },
    { question: 'What should I do in case of a dental emergency?', answer: 'Call us immediately at +1 (555) 010-2020. We reserve dedicated emergency slots every day for urgent toothaches, chips, or severe pain.', category: 'Services' },
    { question: 'Do you offer cosmetic dental consultations?', answer: 'Yes, we offer complimentary 15-minute cosmetic consultations for porcelain veneers, composite bonding, and Invisalign.', category: 'Services' },
    { question: 'What is your cancellation policy?', answer: 'We require a 24-hour notice for cancellations or rescheduling to avoid a fee of $50.', category: 'Services' },
    { question: 'Do you treat children?', answer: 'Absolutely! We love family dentistry and provide gentle dental care for children of all ages.', category: 'Services' },
    { question: 'What is included in a new patient special?', answer: 'For $149, new patients without insurance receive a comprehensive exam, digital X-rays, and a routine cleaning.', category: 'Pricing' },
  ];

  for (const faq of faqsData) {
    await prisma.fAQ.create({
      data: {
        ...faq,
        businessId: business.id,
        active: true,
      },
    });
  }

  console.log(`📚 Seeded ${faqsData.length} FAQs.`);

  // 5. Seed Business Hours
  const hoursData = [
    { dayOfWeek: 'Monday', openTime: '09:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 'Tuesday', openTime: '09:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 'Wednesday', openTime: '09:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 'Thursday', openTime: '09:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 'Friday', openTime: '09:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 'Saturday', openTime: '10:00', closeTime: '14:00', isClosed: false },
    { dayOfWeek: 'Sunday', openTime: '00:00', closeTime: '00:00', isClosed: true },
  ];

  for (const hour of hoursData) {
    await prisma.businessHours.create({
      data: {
        ...hour,
        businessId: business.id,
      },
    });
  }

  console.log('⏰ Seeded business hours.');

  // 6. Seed Conversations & Messages (including 3 Urgent, calls, etc.)
  const conversationsData = [
    // 1. Urgent SMS
    {
      customerName: 'Emma Watson',
      customerPhone: '+1 (555) 302-9901',
      customerEmail: 'emma@example.com',
      channel: 'sms',
      status: 'active',
      urgency: 'urgent',
      urgencyReason: 'Customer reports extreme pain and bleeding after a dental extraction yesterday',
      requiresHuman: true,
      messages: [
        { sender: 'customer', content: 'Help! I had a wisdom tooth extracted yesterday and the bleeding has started again and won\'t stop. It hurts terribly.' },
        { sender: 'ai', content: 'I\'m very sorry to hear this, Emma. This sounds urgent. I have flagged your message for our dental team and they will contact you immediately. Please bite down on a clean piece of gauze or a damp tea bag with firm, steady pressure for 30 minutes, keeping your head elevated. If you feel lightheaded, please head to the nearest emergency room.' }
      ]
    },
    // 2. Urgent Call
    {
      customerName: 'Liam Neeson',
      customerPhone: '+1 (555) 441-2309',
      customerEmail: 'liam@example.com',
      channel: 'call',
      status: 'active',
      urgency: 'urgent',
      urgencyReason: 'Payment double charge billing dispute requiring office manager review',
      requiresHuman: true,
      messages: [
        { sender: 'customer', content: 'Hello, I just saw my bank statement and I was charged twice ($399 twice) for my teeth whitening yesterday. Please fix this.' },
        { sender: 'ai', content: 'I understand your frustration, Liam. I have flagged this double transaction as urgent and routed it to Dr. Bloom\'s billing desk. We will review the merchant ledger immediately. If there is a duplicate charge, we will reverse it today. Can I verify your email address to send a receipt once sorted?' },
        { sender: 'customer', content: 'My email is liam@example.com. Contact me as soon as it is done.' },
        { sender: 'ai', content: 'Got it, liam@example.com. I have added this note. Our team will contact you shortly to confirm the refund.' }
      ],
      call: {
        duration: 105,
        status: 'completed',
        transcript: 'Customer: Hello, I just saw my bank statement and I was charged twice ($399 twice) for my teeth whitening yesterday. Please fix this.\nAI: I understand your frustration, Liam. I have flagged this double transaction as urgent and routed it to Dr. Bloom\'s billing desk. We will review the merchant ledger immediately. If there is a duplicate charge, we will reverse it today. Can I verify your email address to send a receipt once sorted?\nCustomer: My email is liam@example.com. Contact me as soon as it is done.\nAI: Got it, liam@example.com. I have added this note. Our team will contact you shortly to confirm the refund.'
      }
    },
    // 3. Urgent Instagram DM
    {
      customerName: 'Sophia Loren',
      customerPhone: '+1 (555) 911-0021',
      customerEmail: 'sophia@example.com',
      channel: 'instagram',
      status: 'active',
      urgency: 'urgent',
      urgencyReason: 'Chipped front tooth emergency right before an important presentation tomorrow',
      requiresHuman: true,
      messages: [
        { sender: 'customer', content: 'Oh my god, I just chipped my front tooth eating lunch! I have a major presentation tomorrow morning. Can you squeeze me in today? Please!' },
        { sender: 'ai', content: 'Oh no, Sophia! I understand how stressful that must be, especially with a presentation tomorrow. I have flagged your chipped tooth as urgent. Let me check the schedule immediately.' },
        { sender: 'customer', content: 'Please do, I can come in at any time. My cell is +1 (555) 911-0021.' },
        { sender: 'ai', content: 'Thank you, Sophia. I\'ve notified the clinic coordinator of your chipped tooth emergency. Dr. Bloom has a gap at 4:30 PM today. Someone will text or call your cell phone within 15 minutes to confirm.' }
      ]
    },
    // 4. Normal Web Chat (Resolved)
    {
      customerName: 'Aria Grande',
      customerPhone: '+1 (555) 777-1234',
      customerEmail: 'aria@example.com',
      channel: 'chat',
      status: 'resolved',
      urgency: 'normal',
      requiresHuman: false,
      messages: [
        { sender: 'customer', content: 'Hi, are you guys located near the metro station?' },
        { sender: 'ai', content: 'Hello! Yes, Bloom Dental Studio is located at 123 Main Street. We are just a 5-minute walk from the Sparkle City Central Metro Station. Free parking is also available in the back lot if you decide to drive!' },
        { sender: 'customer', content: 'Awesome, thanks! That makes it very easy.' },
        { sender: 'ai', content: 'You\'re welcome! Let me know if you would like me to help you schedule a dental checkup.' }
      ]
    },
    // 5. Normal WhatsApp (Active)
    {
      customerName: 'John Doe',
      customerPhone: '+1 (555) 482-1922',
      customerEmail: 'john@example.com',
      channel: 'whatsapp',
      status: 'active',
      urgency: 'normal',
      requiresHuman: false,
      messages: [
        { sender: 'customer', content: 'Hello, how much is a teeth cleaning session?' },
        { sender: 'ai', content: 'Hi John! A standard dental cleaning is $150. However, if you are a new patient without insurance, we offer a New Patient Special for $149 which includes a comprehensive dental exam, digital X-rays, and a cleaning!' },
        { sender: 'customer', content: 'That sounds like a great deal! Do I need a referral?' },
        { sender: 'ai', content: 'No referral is needed at all! Would you like me to see what morning slots we have available next week for the new patient special?' }
      ]
    },
    // 6. Normal Call (Completed)
    {
      customerName: 'Robert De Niro',
      customerPhone: '+1 (555) 332-9011',
      customerEmail: 'robert@example.com',
      channel: 'call',
      status: 'resolved',
      urgency: 'normal',
      requiresHuman: false,
      messages: [
        { sender: 'customer', content: 'Yes, hello. I wanted to verify if you are open on Saturdays?' },
        { sender: 'ai', content: 'Hi Robert! Yes, we are open on Saturdays from 10:00 AM to 2:00 PM for cleanings and consultations. We are closed on Sundays.' },
        { sender: 'customer', content: 'Okay, excellent. Thank you.' },
        { sender: 'ai', content: 'My pleasure! Have a wonderful day.' }
      ],
      call: {
        duration: 45,
        status: 'completed',
        transcript: 'Customer: Yes, hello. I wanted to verify if you are open on Saturdays?\nAI: Hi Robert! Yes, we are open on Saturdays from 10:00 AM to 2:00 PM for cleanings and consultations. We are closed on Sundays.\nCustomer: Okay, excellent. Thank you.\nAI: My pleasure! Have a wonderful day.'
      }
    },
    // 7. Important SMS (Needs takeover for schedule)
    {
      customerName: 'Oliver Twist',
      customerPhone: '+1 (555) 888-2321',
      customerEmail: 'oliver@example.com',
      channel: 'sms',
      status: 'active',
      urgency: 'important',
      requiresHuman: true,
      messages: [
        { sender: 'customer', content: 'Hi, I need to book a dental consultation for porcelain veneers. Can I get a slot next Monday morning?' },
        { sender: 'ai', content: 'Hi Oliver! Dr. Bloom has a cosmetic consultation slot open next Monday (August 31st) at 9:30 AM or 11:00 AM. Do either of those work for you?' },
        { sender: 'customer', content: 'Monday at 9:30 AM works well. What do I need to bring?' },
        { sender: 'ai', content: 'Fantastic! I\'ve pre-reserved Monday at 9:30 AM for you. Just bring a photo ID and any current dental insurance card. I am passing this request to our receptionist team to confirm the appointment.' }
      ]
    },
    // 8. Normal Instagram (Active)
    {
      customerName: 'Gigi Hadid',
      customerPhone: '+1 (555) 444-5555',
      customerEmail: 'gigi@example.com',
      channel: 'instagram',
      status: 'active',
      urgency: 'normal',
      requiresHuman: false,
      messages: [
        { sender: 'customer', content: 'Do you guys do Invisalign treatments?' },
        { sender: 'ai', content: 'Hello Gigi! Yes, we do offer Invisalign aligners to straighten teeth. We offer complimentary consultations to assess your suitability and map out a custom treatment plan. Would you like to check availability?' }
      ]
    },
    // 9. Normal WhatsApp (Resolved)
    {
      customerName: 'Bruno Mars',
      customerPhone: '+1 (555) 121-2323',
      customerEmail: 'bruno@example.com',
      channel: 'whatsapp',
      status: 'resolved',
      urgency: 'normal',
      requiresHuman: false,
      messages: [
        { sender: 'customer', content: 'Hello! Can I cancel my appointment for tomorrow afternoon?' },
        { sender: 'ai', content: 'Hello Bruno. Yes, we can assist with that. Please note that our cancellation policy requires 24 hours notice to avoid a $50 fee. Since your appointment is tomorrow, what is your name and the scheduled time so we can check?' },
        { sender: 'customer', content: 'Yes, Bruno Mars. The appointment is tomorrow at 3 PM. I have to work.' },
        { sender: 'ai', content: 'Thank you, Bruno. Since it is exactly 26 hours before your appointment, we have successfully cancelled it without any charge. Let us know when you would like to reschedule!' },
        { sender: 'customer', content: 'Great, thanks for the quick response!' }
      ]
    },
    // 10. Normal Call (Missed Call)
    {
      customerName: 'Unknown Caller',
      customerPhone: '+1 (555) 998-1122',
      customerEmail: null,
      channel: 'call',
      status: 'active',
      urgency: 'normal',
      requiresHuman: false,
      messages: [],
      call: {
        duration: 0,
        status: 'missed',
        transcript: null
      }
    },
    // 11. Normal Call (Completed)
    {
      customerName: 'Lady Gaga',
      customerPhone: '+1 (555) 555-1111',
      customerEmail: 'gaga@example.com',
      channel: 'call',
      status: 'resolved',
      urgency: 'normal',
      requiresHuman: false,
      messages: [
        { sender: 'customer', content: 'Do you take Delta Dental insurance?' },
        { sender: 'ai', content: 'Yes! We accept Delta Dental PPO insurance plans. We can verify your coverage percentage and deductibles when you arrive.' }
      ],
      call: {
        duration: 35,
        status: 'completed',
        transcript: 'Customer: Do you take Delta Dental insurance?\nAI: Yes! We accept Delta Dental PPO insurance plans. We can verify your coverage percentage and deductibles when you arrive.'
      }
    },
    // 12. Normal SMS (Active)
    {
      customerName: 'Harry Potter',
      customerPhone: '+1 (555) 000-7777',
      customerEmail: 'harry@hogwarts.edu',
      channel: 'sms',
      status: 'active',
      urgency: 'normal',
      requiresHuman: false,
      messages: [
        { sender: 'customer', content: 'Do you do dental fillings?' },
        { sender: 'ai', content: 'Hi Harry! Yes, we do tooth-colored composite fillings to treat cavities and repair minor chips. They look completely natural. Would you like to schedule an appointment for an exam?' }
      ]
    },
    // 13. Normal Web Chat (Active)
    {
      customerName: 'Selena Gomez',
      customerPhone: '+1 (555) 234-9988',
      customerEmail: 'selena@example.com',
      channel: 'chat',
      status: 'active',
      urgency: 'normal',
      requiresHuman: false,
      messages: [
        { sender: 'customer', content: 'Hi, what is your phone number? I want to share it with my sister.' },
        { sender: 'ai', content: 'Hi Selena! Our phone number is +1 (555) 010-2020. You can also share our website: www.bloomdental.studio. We would love to welcome your sister to the Bloom family!' }
      ]
    },
    // 14. Normal Call (Completed)
    {
      customerName: 'Taylor Swift',
      customerPhone: '+1 (555) 198-9198',
      customerEmail: 'taylor@taylor.com',
      channel: 'call',
      status: 'resolved',
      urgency: 'normal',
      requiresHuman: false,
      messages: [
        { sender: 'customer', content: 'Can I pay my bill online?' },
        { sender: 'ai', content: 'Hi Taylor! Yes, we send a secure payment link via SMS or email after your visit, allowing you to settle your invoice online using credit cards or Apple Pay.' }
      ],
      call: {
        duration: 25,
        status: 'completed',
        transcript: 'Customer: Can I pay my bill online?\nAI: Hi Taylor! Yes, we send a secure payment link via SMS or email after your visit, allowing you to settle your invoice online using credit cards or Apple Pay.'
      }
    },
    // 15. Normal WhatsApp (Active)
    {
      customerName: 'Justin Bieber',
      customerPhone: '+1 (555) 902-1010',
      customerEmail: 'justin@example.com',
      channel: 'whatsapp',
      status: 'active',
      urgency: 'normal',
      requiresHuman: false,
      messages: [
        { sender: 'customer', content: 'Hi, do you offer teeth whitening?' },
        { sender: 'ai', content: 'Hello Justin! Yes, we do. We offer an in-office professional whitening treatment for $399 which gives instant results, or custom take-home kits for $199. Would you like to schedule a session?' }
      ]
    }
  ];

  for (const convData of conversationsData) {
    const { messages, call, ...convFields } = convData;

    const conversation = await prisma.conversation.create({
      data: {
        ...convFields,
        businessId: business.id,
      },
    });

    // Create messages
    for (const msg of messages) {
      await prisma.message.create({
        data: {
          sender: msg.sender,
          content: msg.content,
          conversationId: conversation.id,
        },
      });
    }

    // Create call logs if applicable
    if (call) {
      await prisma.call.create({
        data: {
          duration: call.duration,
          status: call.status,
          transcript: call.transcript,
          conversationId: conversation.id,
        },
      });
    }

    // If urgent or important, create escalations and notifications
    if (convFields.urgency === 'urgent') {
      await prisma.escalation.create({
        data: {
          reason: convFields.urgencyReason || 'Urgent request detected',
          status: 'pending',
          conversationId: conversation.id,
        },
      });

      await prisma.notification.create({
        data: {
          type: 'urgent_conversation',
          title: '🚨 Urgent Conversation Detected',
          message: `${convFields.customerName || 'Customer'} reported: "${messages[0]?.content || 'Urgent request'}"`,
          isRead: false,
          conversationId: conversation.id,
        },
      });
    } else if (convFields.channel === 'call' && call && call.status === 'missed') {
      await prisma.notification.create({
        data: {
          type: 'missed_call',
          title: '📞 Missed Call',
          message: `Missed call from ${convFields.customerPhone || 'Unknown Caller'}`,
          isRead: false,
          conversationId: conversation.id,
        },
      });
    }
  }

  console.log(`💬 Seeded ${conversationsData.length} conversations, and related message logs.`);
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
