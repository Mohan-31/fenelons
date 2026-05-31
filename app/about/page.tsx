import Link from 'next/link'

export const metadata = {
  title: "About Us — Fenelon's Butcher Shop",
  description: "Over 30 years of traditional butchering expertise in the heart of the community. Quality meat, honest service.",
}

function ImagePlaceholder({ label, aspect = 'aspect-video' }: { label: string; aspect?: string }) {
  return (
    <div className={`${aspect} w-full rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 text-white/20`}>
      <div className="w-12 h-12 rounded-2xl border-2 border-white/15 flex items-center justify-center">
        <span className="text-2xl font-black italic text-white/20">F</span>
      </div>
      <p className="text-xs font-black uppercase tracking-[0.2em]">{label}</p>
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="bg-[#0a0a0a] text-white">

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-16">
        <div className="inline-block px-3 py-1.5 bg-[#8B0000]/15 border border-[#8B0000]/25 rounded text-[#8B0000] text-[10px] font-black uppercase tracking-[0.25em] mb-6">
          Est. Since the Beginning
        </div>
        <h1
          className="font-black italic uppercase text-white leading-none"
          style={{ fontSize: 'clamp(3rem, 10vw, 8rem)' }}
        >
          Our <span className="text-[#8B0000]">Story.</span>
        </h1>
        <p className="text-white/40 font-bold uppercase text-[11px] tracking-[0.25em] mt-5 max-w-xl">
          Traditional craft · premium sourcing · community first
        </p>
      </section>

      {/* Hero Image */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <ImagePlaceholder label="Shop exterior / team photo" aspect="aspect-[21/9]" />
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <div className="inline-block px-2 py-1 bg-[#8B0000]/10 rounded text-[#8B0000] text-[10px] font-black uppercase tracking-widest mb-5">
              Who We Are
            </div>
            <h2
              className="font-black italic uppercase text-white leading-none mb-8"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              More Than<br />
              <span className="text-[#8B0000]">A Butcher.</span>
            </h2>
            <div className="space-y-5 text-white/55 font-medium text-base leading-relaxed">
              <p>
                Fenelon&apos;s has been at the heart of this community for generations. We started as a small family butcher shop with a single mission: deliver the finest cuts of meat with the kind of honest, personal service that has all but disappeared from modern retail.
              </p>
              <p>
                We know our farmers by name. We know our customers by face. Every animal we source is raised with care, every cut is prepared with skill, and every order is packed with pride.
              </p>
              <p>
                At Christmas, that commitment comes to life in a special way — thousands of families trust us to provide the centrepiece of their holiday table. That trust is something we never take lightly.
              </p>
            </div>
          </div>
          <ImagePlaceholder label="Inside the shop / counter" aspect="aspect-square" />
        </div>
      </section>

      {/* Quality Sourcing */}
      <section className="bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <ImagePlaceholder label="Sourcing / farm visit photo" aspect="aspect-[4/3]" />
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-block px-2 py-1 bg-[#8B0000]/10 rounded text-[#8B0000] text-[10px] font-black uppercase tracking-widest mb-5">
                Quality Sourcing
              </div>
              <h2
                className="font-black italic uppercase text-white leading-none mb-8"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
              >
                Raised Right.<br />
                <span className="text-[#8B0000]">Cut Properly.</span>
              </h2>
              <div className="space-y-5 text-white/55 font-medium text-base leading-relaxed">
                <p>
                  Every product we sell traces back to farms we personally vetted. Free-range turkeys roam open land. Our hams come from pigs raised on natural diets. Our beef is aged to perfection before it ever reaches our block.
                </p>
                <p>
                  We believe the quality of what ends up on your table is determined long before it arrives in our shop. That&apos;s why we start our process at the source — building relationships with ethical, sustainable producers who share our standards.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10">
                {[
                  { stat: '100%', label: 'Free Range Poultry' },
                  { stat: 'Local', label: 'Trusted Suppliers' },
                  { stat: 'Fresh', label: 'Never Frozen' },
                  { stat: '30+', label: 'Years of Craft' },
                ].map(({ stat, label }) => (
                  <div key={label} className="bg-white/4 rounded-2xl p-5 border border-white/8">
                    <p className="text-3xl font-black italic text-[#8B0000] leading-none">{stat}</p>
                    <p className="text-white/40 font-bold uppercase text-[10px] tracking-wider mt-2">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Butchering Expertise */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center mb-16">
          <div className="inline-block px-2 py-1 bg-[#8B0000]/10 rounded text-[#8B0000] text-[10px] font-black uppercase tracking-widest mb-5">
            Our Craft
          </div>
          <h2
            className="font-black italic uppercase text-white leading-none"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Traditional Techniques.<br />
            <span className="text-[#8B0000]">Modern Precision.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            {
              title: 'Hand-Cut Every Time',
              body: 'We never rely on machines where a skilled hand does it better. Each cut is made to order by our experienced butchers — whether it\'s a whole turkey crown or a precision-trimmed rib eye.',
            },
            {
              title: 'Aged to Perfection',
              body: 'Our beef is aged in-house for optimal tenderness and depth of flavour. The process takes time, but the result is a product you cannot find on supermarket shelves.',
            },
            {
              title: 'Custom Preparation',
              body: 'Every customer has different needs. We offer bespoke preparation on request — specific cut styles, portion sizes, trussing for roasting, or any special requirement you bring to us.',
            },
          ].map(({ title, body }) => (
            <div key={title} className="bg-white/4 rounded-3xl p-8 border border-white/8">
              <div className="w-10 h-10 rounded-2xl bg-[#8B0000]/15 flex items-center justify-center mb-5">
                <span className="text-lg font-black italic text-[#8B0000]">F</span>
              </div>
              <h3 className="font-black italic uppercase text-white text-lg leading-tight mb-4">{title}</h3>
              <p className="text-white/45 font-medium text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Expertise image */}
        <ImagePlaceholder label="Butchers at work / prep area" aspect="aspect-[3/1]" />
      </section>

      {/* Freshness & Quality Control */}
      <section className="bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-block px-2 py-1 bg-[#8B0000]/10 rounded text-[#8B0000] text-[10px] font-black uppercase tracking-widest mb-5">
                Quality Control
              </div>
              <h2
                className="font-black italic uppercase text-white leading-none mb-8"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
              >
                Freshness You<br />
                <span className="text-[#8B0000]">Can Taste.</span>
              </h2>
              <div className="space-y-5 text-white/55 font-medium text-base leading-relaxed">
                <p>
                  Every order that leaves our shop is inspected before it goes out the door. We operate a strict temperature chain from delivery through preparation to your hands — nothing compromises on freshness.
                </p>
                <p>
                  Our pre-order system exists precisely because of this commitment. By knowing demand ahead of time, we can source exactly what we need and process it fresh — rather than batch-preparing days in advance the way larger operations must.
                </p>
                <p>
                  When you collect your order, you&apos;re getting meat that was prepared for you specifically, not pulled from a shelf.
                </p>
              </div>
            </div>
            <ImagePlaceholder label="Quality / freshness / cold storage" aspect="aspect-square" />
          </div>
        </div>
      </section>

      {/* Customer Satisfaction */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-2">
            <div className="inline-block px-2 py-1 bg-[#8B0000]/10 rounded text-[#8B0000] text-[10px] font-black uppercase tracking-widest mb-5">
              Our Customers
            </div>
            <h2
              className="font-black italic uppercase text-white leading-none"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
            >
              Built on<br />
              <span className="text-[#8B0000]">Trust.</span>
            </h2>
            <p className="text-white/45 font-medium text-sm leading-relaxed mt-6">
              The same families have been ordering from Fenelon&apos;s for decades. That kind of loyalty doesn&apos;t happen by accident — it comes from consistently doing the right thing: honest pricing, real quality, and treating every customer like they matter.
            </p>
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 gap-4">
            {[
              {
                quote: "We've ordered our Christmas turkey from Fenelon's for over 15 years. The quality is always exceptional and the service is second to none.",
                name: 'Regular Customer',
              },
              {
                quote: "The pre-order system makes Christmas so much easier. I know exactly what I'm getting, and it's always perfect when I collect it.",
                name: 'Annual Pre-Order Customer',
              },
              {
                quote: "You can tell the difference between supermarket meat and what Fenelon's provides. There's simply no comparison.",
                name: 'Local Family',
              },
            ].map(({ quote, name }) => (
              <div key={name} className="bg-white/4 rounded-2xl p-6 border border-white/8">
                <p className="text-white/60 font-medium text-sm leading-relaxed italic mb-4">&ldquo;{quote}&rdquo;</p>
                <p className="text-[#8B0000] font-black uppercase text-[10px] tracking-widest">— {name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-32">
        <div className="bg-[#8B0000] rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 text-[20rem] font-black italic text-white leading-none select-none -translate-y-1/4">F</div>
          </div>
          <div className="relative">
            <p className="text-white/60 font-black uppercase text-[10px] tracking-[0.3em] mb-4">Ready to Order?</p>
            <h2
              className="font-black italic uppercase text-white leading-none mb-8"
              style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}
            >
              Secure Your<br />Christmas Order.
            </h2>
            <Link
              href="/#order"
              className="inline-flex items-center gap-3 bg-white text-[#8B0000] px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-red-50 transition-colors"
            >
              Place Your Order →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
