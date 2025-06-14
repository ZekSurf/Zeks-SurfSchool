interface BlogSection {
  type: 'paragraph' | 'heading' | 'list' | 'tip';
  content?: string;
  items?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  preview: string;
  imageUrl: string;
  date: string;
  content: BlogSection[];
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Best Time to Surf in Southern California: A Season-by-Season Guide",
    preview: "Discover the perfect waves year-round in SoCal. From winter swells to summer breaks, learn when and where to catch the best waves for your skill level.",
    imageUrl: "/beaches/doheny.png",
    date: "March 15, 2024",
    content: [
      {
        type: 'paragraph',
        content: "Southern California is a surfer's paradise, offering year-round waves that cater to every skill level. But knowing when and where to surf can make all the difference in your experience. Let's break down what each season has to offer for both beginners and experienced surfers."
      },
      {
        type: 'heading',
        content: "Winter (December - February)"
      },
      {
        type: 'paragraph',
        content: "Winter brings the biggest and most consistent swells to Southern California. North Pacific storms generate powerful waves that create epic conditions for experienced surfers. However, this doesn't mean beginners need to stay out of the water."
      },
      {
        type: 'list',
        items: [
          "Larger swells from the northwest",
          "Water temperatures around 60-65°F (wetsuit required)",
          "Less crowded beaches",
          "Best for intermediate to advanced surfers"
        ]
      },
      {
        type: 'tip',
        content: "Beginners should stick to protected spots like Doheny State Beach during winter months, where the waves are more manageable."
      },
      {
        type: 'heading',
        content: "Spring (March - May)"
      },
      {
        type: 'paragraph',
        content: "Spring offers a perfect mix of conditions, making it an ideal time for surfers of all levels. The crowds are still thin, and the weather starts to warm up while maintaining decent-sized swells."
      },
      {
        type: 'list',
        items: [
          "Mix of northwest and south swells",
          "Water temperatures starting to rise",
          "Moderate crowds",
          "Great for all skill levels"
        ]
      },
      {
        type: 'heading',
        content: "Summer (June - August)"
      },
      {
        type: 'paragraph',
        content: "Summer brings warmer water and more consistent, gentler waves, making it the perfect time for beginners to learn. However, expect more crowded beaches during peak vacation season."
      },
      {
        type: 'list',
        items: [
          "Southern hemisphere swells",
          "Warmer water temperatures (wetsuit optional)",
          "More crowded conditions",
          "Perfect for beginners"
        ]
      },
      {
        type: 'tip',
        content: "Early morning sessions are your best bet during summer to avoid crowds and catch the cleanest conditions before the wind picks up."
      },
      {
        type: 'heading',
        content: "Fall (September - November)"
      },
      {
        type: 'paragraph',
        content: "Many locals consider fall the best time to surf in Southern California. The water is still warm from summer, the crowds thin out, and you can catch a mix of south and northwest swells."
      },
      {
        type: 'list',
        items: [
          "Mixed swell directions",
          "Warm water lingering from summer",
          "Less crowded than summer",
          "Excellent for all skill levels"
        ]
      },
      {
        type: 'paragraph',
        content: "Remember that these are general patterns, and conditions can vary significantly from day to day. Always check the local surf report and weather conditions before heading out, and never surf alone if you're a beginner."
      }
    ]
  },
  {
    id: "2",
    title: "5 Essential Tips for First-Time Surfers",
    preview: "Ready to catch your first wave? Learn the fundamental techniques and common mistakes to avoid. Plus, get insider tips on choosing the right beginner-friendly spots.",
    imageUrl: "/beaches/tstreet.png",
    date: "March 10, 2024",
    content: [
      {
        type: 'paragraph',
        content: "Taking your first steps into the world of surfing can feel overwhelming, but with the right guidance and preparation, you'll be catching waves in no time. Here are five essential tips that every beginner surfer should know before paddling out."
      },
      {
        type: 'heading',
        content: "1. Master the Pop-Up on Land First"
      },
      {
        type: 'paragraph',
        content: "The pop-up is one of the most crucial movements in surfing. Before hitting the water, spend time practicing this motion on the beach. It builds muscle memory and helps you understand the correct positioning of your feet and body."
      },
      {
        type: 'tip',
        content: "Draw a line in the sand to represent your surfboard's stringer (center line). Practice popping up with your feet landing on either side of this line, shoulder-width apart."
      },
      {
        type: 'heading',
        content: "2. Choose the Right Board"
      },
      {
        type: 'paragraph',
        content: "As a beginner, you'll want to start with a longboard or foam board. These boards offer more stability and flotation, making it easier to catch waves and maintain balance while learning."
      },
      {
        type: 'list',
        items: [
          "Minimum 8-9 feet in length",
          "Wide nose and tail for stability",
          "Thick rails for better flotation",
          "Soft top for safety"
        ]
      },
      {
        type: 'heading',
        content: "3. Understand Ocean Safety"
      },
      {
        type: 'paragraph',
        content: "Before you even think about catching waves, you need to understand basic ocean safety. This includes identifying rip currents, understanding wave patterns, and knowing your limits."
      },
      {
        type: 'list',
        items: [
          "Always check conditions before entering",
          "Learn to identify rip currents",
          "Know the basic surf etiquette",
          "Never surf alone as a beginner"
        ]
      },
      {
        type: 'heading',
        content: "4. Perfect Your Paddle Technique"
      },
      {
        type: 'paragraph',
        content: "Strong, efficient paddling is key to catching waves. Position yourself in the center of the board, keeping your chest up and legs together. Use long, deep strokes, reaching far forward and pulling all the way back."
      },
      {
        type: 'tip',
        content: "Practice paddling in calm water first. Focus on keeping your board stable and maintaining a straight line while paddling."
      },
      {
        type: 'heading',
        content: "5. Start Small and Progress Gradually"
      },
      {
        type: 'paragraph',
        content: "Don't try to rush your progression. Start with small, gentle waves and gradually work your way up as your confidence and skills improve. Remember, even the best surfers started on the small stuff."
      },
      {
        type: 'paragraph',
        content: "Learning to surf is a journey, not a race. Take your time, stay safe, and most importantly, have fun! With these fundamentals in mind, you'll be well on your way to catching your first waves and developing a lifelong passion for surfing."
      }
    ]
  },
  {
    id: "3",
    title: "Local's Guide to San Onofre: The Perfect Longboard Wave",
    preview: "Explore one of California's most iconic surf spots. From best tide conditions to parking tips, everything you need to know about surfing San Onofre.",
    imageUrl: "/sanonofre.png",
    date: "March 5, 2024",
    content: [
      {
        type: 'paragraph',
        content: "San Onofre State Beach, affectionately known as 'San O' by locals, is a legendary surf spot that's been drawing wave riders since the 1930s. Known for its perfect peeling waves and welcoming atmosphere, it's a must-visit destination for any longboarder."
      },
      {
        type: 'heading',
        content: "The Magic of San Onofre"
      },
      {
        type: 'paragraph',
        content: "What makes San O special isn't just its waves – it's the entire vibe. This spot embodies the true spirit of surfing, where everyone from first-timers to seasoned veterans can find their perfect wave. The break's gentle slope and predictable pattern make it ideal for traditional longboarding."
      },
      {
        type: 'heading',
        content: "Best Conditions and Timing"
      },
      {
        type: 'list',
        items: [
          "Ideal swell direction: South to southwest",
          "Best tide: Mid to high tide",
          "Optimal wave size: 2-6 feet",
          "Season: Best during summer south swells"
        ]
      },
      {
        type: 'tip',
        content: "The waves tend to be cleanest in the early morning before the onshore winds pick up. Aim to arrive before 8 AM for the best conditions."
      },
      {
        type: 'heading',
        content: "Navigating the Spot"
      },
      {
        type: 'paragraph',
        content: "San Onofre features several distinct breaks, each with its own character. The main areas are The Point, Old Man's, and Dog Patch. Old Man's is the most popular and beginner-friendly section, known for its consistent, rolling waves perfect for longboarding."
      },
      {
        type: 'list',
        items: [
          "The Point: More advanced, longer rides",
          "Old Man's: Perfect for all skill levels",
          "Dog Patch: Less crowded, slightly punchier waves"
        ]
      },
      {
        type: 'heading',
        content: "Local Etiquette and Tips"
      },
      {
        type: 'paragraph',
        content: "San O has a strong community vibe and its own unique culture. Respect for others and the environment is paramount. The lineup operates on a take-your-turn basis, and sharing waves is common practice."
      },
      {
        type: 'list',
        items: [
          "Wait your turn in the lineup",
          "Share waves when possible",
          "Respect the environment and pack out what you pack in",
          "Be friendly and social – it's part of the San O experience"
        ]
      },
      {
        type: 'heading',
        content: "Practical Information"
      },
      {
        type: 'paragraph',
        content: "Getting to San Onofre requires a State Park pass or day-use fee. Parking can fill up quickly, especially on weekends and during summer. There's a short walk to the beach, so bring a wagon or surf cart if you have one."
      },
      {
        type: 'tip',
        content: "Consider becoming a State Park pass member if you plan to surf here regularly. It pays for itself in about 10 visits."
      },
      {
        type: 'paragraph',
        content: "Whether you're a longboarder looking for perfect peelers or a beginner seeking a welcoming spot to progress, San Onofre offers something special. Its combination of consistent waves, friendly atmosphere, and rich surfing history makes it a true California surfing treasure."
      }
    ]
  },
  {
    id: "4",
    title: "Understanding Ocean Safety: Reading Waves and Spotting Rips",
    preview: "Safety first! Learn how to read wave patterns, identify rip currents, and make smart decisions about when to paddle out and when to stay on the beach.",
    imageUrl: "/beaches/tstreet.png",
    date: "February 28, 2024",
    content: [
      {
        type: 'paragraph',
        content: "Ocean safety is the foundation of surfing. Before you can enjoy riding waves, you need to understand how to read the ocean and identify potential hazards. This knowledge isn't just about improving your surfing – it could save your life."
      },
      {
        type: 'heading',
        content: "Reading Wave Patterns"
      },
      {
        type: 'paragraph',
        content: "Waves come in sets with lulls in between. Learning to read these patterns helps you time your paddle-outs and position yourself for the best waves. Watch the ocean for at least 15-20 minutes before entering."
      },
      {
        type: 'list',
        items: [
          "Count waves in each set",
          "Time the intervals between sets",
          "Notice where waves are breaking consistently",
          "Observe how other surfers are positioning themselves"
        ]
      },
      {
        type: 'heading',
        content: "Identifying Rip Currents"
      },
      {
        type: 'paragraph',
        content: "Rip currents are powerful channels of water flowing away from shore. They're one of the ocean's most dangerous hazards, but they're also predictable and identifiable."
      },
      {
        type: 'list',
        items: [
          "Look for gaps in the breaking waves",
          "Watch for discolored or churning water",
          "Notice areas where debris flows steadily seaward",
          "Identify channels of calm water between breaking waves"
        ]
      },
      {
        type: 'tip',
        content: "If caught in a rip current, don't fight it. Swim parallel to the shore to escape the current, then angle back to the beach."
      },
      {
        type: 'heading',
        content: "Understanding Wave Types"
      },
      {
        type: 'paragraph',
        content: "Different types of waves are suitable for different skill levels. Learning to identify these can help you make smart decisions about when to paddle out."
      },
      {
        type: 'list',
        items: [
          "Spilling waves: Best for beginners, gentle slope",
          "Plunging waves: More hollow, better for experienced surfers",
          "Closeouts: Avoid these, they break all at once",
          "Reform waves: Good for learning, break multiple times"
        ]
      },
      {
        type: 'heading',
        content: "Weather and Conditions"
      },
      {
        type: 'paragraph',
        content: "Always check multiple factors before deciding to surf. Weather conditions can dramatically affect wave quality and safety."
      },
      {
        type: 'list',
        items: [
          "Wind direction and speed",
          "Tide levels and timing",
          "Swell direction and period",
          "Local weather patterns"
        ]
      },
      {
        type: 'tip',
        content: "When in doubt, don't paddle out. There will always be another day to surf, and it's better to stay safe than risk dangerous conditions."
      },
      {
        type: 'heading',
        content: "Essential Safety Practices"
      },
      {
        type: 'paragraph',
        content: "Beyond reading conditions, there are several safety practices every surfer should follow."
      },
      {
        type: 'list',
        items: [
          "Never surf alone",
          "Always use a leash",
          "Know your limits",
          "Stay aware of your surroundings",
          "Respect lifeguard warnings and flags"
        ]
      },
      {
        type: 'paragraph',
        content: "Remember, becoming ocean-aware is a continuous journey. Even experienced surfers are always learning and adapting to the ocean's ever-changing conditions. Take your time, stay observant, and prioritize safety over everything else."
      }
    ]
  },
  {
    id: "5",
    title: "The Ultimate Guide to Surf Etiquette",
    preview: "Master the unwritten rules of surfing. From right of way to dropping in, learn how to share waves and earn respect in the lineup.",
    imageUrl: "/beaches/doheny.png",
    date: "February 20, 2024",
    content: [
      {
        type: 'paragraph',
        content: "Surf etiquette isn't just about being polite – it's about safety, respect, and ensuring everyone in the water has a chance to enjoy the waves. Understanding and following these unwritten rules will make you a welcome addition to any lineup."
      },
      {
        type: 'heading',
        content: "The Fundamental Rules"
      },
      {
        type: 'list',
        items: [
          "Right of Way: Surfer closest to the peak has priority",
          "Don't Drop In: Never take off on a wave someone is already riding",
          "Don't Snake: Don't paddle around someone to get priority",
          "Communicate: Call out 'Left!' or 'Right!' when catching a wave"
        ]
      },
      {
        type: 'heading',
        content: "Understanding Priority"
      },
      {
        type: 'paragraph',
        content: "Priority in surfing is based on position relative to the peak (where the wave first starts to break). The surfer closest to the peak, or who has been waiting longest, has the right of way."
      },
      {
        type: 'tip',
        content: "If you're unsure about priority, it's better to let the wave go. There will always be another one, and showing respect earns respect."
      },
      {
        type: 'heading',
        content: "Paddling Rules"
      },
      {
        type: 'paragraph',
        content: "Proper paddling etiquette is crucial for maintaining order in the lineup and avoiding collisions."
      },
      {
        type: 'list',
        items: [
          "Paddle wide around the break zone",
          "Don't paddle straight through the lineup",
          "Look before paddling for a wave",
          "Give way to riders on waves"
        ]
      },
      {
        type: 'heading',
        content: "Sharing the Waves"
      },
      {
        type: 'paragraph',
        content: "Different spots have different vibes, but some universal principles apply to sharing waves respectfully."
      },
      {
        type: 'list',
        items: [
          "Don't hog all the waves",
          "Take turns with other surfers",
          "Be extra welcoming to beginners",
          "Spread out in the lineup"
        ]
      },
      {
        type: 'heading',
        content: "Local Respect"
      },
      {
        type: 'paragraph',
        content: "When surfing a new spot, take time to observe and respect local customs. Every break has its own culture and unofficial rules."
      },
      {
        type: 'list',
        items: [
          "Watch and learn before paddling out",
          "Respect the locals who surf there regularly",
          "Don't bring a big group to a local spot",
          "Follow any specific spot rules"
        ]
      },
      {
        type: 'tip',
        content: "Being friendly and respectful goes a long way. A simple smile and 'good morning' can make a big difference in how you're received in the lineup."
      },
      {
        type: 'heading',
        content: "When Things Go Wrong"
      },
      {
        type: 'paragraph',
        content: "Even with the best intentions, mistakes happen. How you handle them matters."
      },
      {
        type: 'list',
        items: [
          "Apologize if you break etiquette",
          "Help others if they're in trouble",
          "Stay calm if someone drops in on you",
          "Learn from your mistakes"
        ]
      },
      {
        type: 'paragraph',
        content: "Remember, everyone was a beginner once. By following these etiquette guidelines, you'll not only become a better surfer but also contribute to the positive vibes that make surfing such a special sport."
      }
    ]
  }
]; 