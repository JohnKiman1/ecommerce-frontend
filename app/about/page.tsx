export default function AboutPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">About StyleHub</h1>
            <p className="text-lg text-muted-foreground">Discover the story behind our brand</p>
          </div>

          <div className="bg-card rounded-lg border border-border p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                At StyleHub, we believe that quality, design, and affordability should go hand in hand. Our mission is to bring carefully curated
                products to customers who appreciate both style and substance. We partner with trusted suppliers to ensure every item meets our
                high standards.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed">
                Founded in 2020, StyleHub started as a small project with a big vision: to make premium lifestyle products accessible to everyone.
                What began as a passion for minimalist design has grown into a thriving online community of over 50,000 satisfied customers across
                the globe. Today, we continue to expand our collection while maintaining our commitment to quality and customer service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Why Choose Us?</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  Premium quality products curated with care
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  Free shipping on orders over $50
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  30-day return policy - no questions asked
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  Exceptional customer support
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  Eco-friendly packaging and sustainable practices
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
