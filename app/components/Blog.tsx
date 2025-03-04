"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import Link from "next/link"

const blogPosts = [
  {
    title: "The Future of AI in Business",
    excerpt: "Explore how artificial intelligence is reshaping industries and driving innovation.",
    date: "2023-05-15",
    category: "Artificial Intelligence",
    slug: "future-of-ai-in-business",
  },
  {
    title: "Blockchain: Beyond Cryptocurrency",
    excerpt: "Discover the transformative potential of blockchain technology across various sectors.",
    date: "2023-05-10",
    category: "Blockchain",
    slug: "blockchain-beyond-cryptocurrency",
  },
  {
    title: "The Rise of Edge Computing",
    excerpt: "Learn how edge computing is revolutionizing data processing and improving response times.",
    date: "2023-05-05",
    category: "Cloud Computing",
    slug: "rise-of-edge-computing",
  },
  // Add more blog posts here
]

export default function Blog() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section id="blog" className="py-20 bg-secondary/10">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl font-bold text-center mb-12 font-poppins"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          Latest Insights
        </motion.h2>
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.article
              key={index}
              className="bg-card p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * index, duration: 0.8 }}
            >
              <Link href={`/blog/${post.slug}`} className="block">
                <h3 className="text-xl font-semibold mb-2 font-poppins hover:text-primary transition-colors">
                  {post.title}
                </h3>
              </Link>
              <p className="text-muted-foreground mb-4 font-inter">{post.excerpt}</p>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{post.category}</span>
                <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
              </div>
            </motion.article>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="bg-primary text-primary-foreground px-6 py-2 rounded-full inline-block hover:bg-primary/90 transition-colors"
          >
            View All Posts
          </Link>
        </div>
      </div>
    </section>
  )
}

