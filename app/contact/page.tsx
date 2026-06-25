'use client'

import { useState } from 'react'
import { useNotification } from '@/contexts/NotificationContext'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  const { addNotification } = useNotification()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    addNotification('Thank you for your message. We will be in touch soon!', 'success')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Contact Us</h1>
            <p className="text-lg text-muted-foreground">We&apos;d love to hear from you. Get in touch with our team.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card rounded-lg border border-border p-6 text-center space-y-3">
              <Mail className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold text-foreground">Email</h3>
              <a href="mailto:support@stylehub.com" className="text-primary hover:text-primary/80 transition-colors">
                support@stylehub.com
              </a>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 text-center space-y-3">
              <Phone className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold text-foreground">Phone</h3>
              <a href="tel:+18005551234" className="text-primary hover:text-primary/80 transition-colors">
                +1 (800) 555-1234
              </a>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 text-center space-y-3">
              <MapPin className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold text-foreground">Location</h3>
              <p className="text-muted-foreground">San Francisco, CA, USA</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card rounded-lg border border-border p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What is this about?"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tell us what you think..."
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
