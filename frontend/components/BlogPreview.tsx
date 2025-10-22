interface BlogPreviewProps {
    title: string;
    excerpt: string;
    content: string;
    tags: string[];
    featuredImage?: string;
    author?: string;
    date?: string;
  }
  
  export function BlogCardPreview({ title, excerpt, featuredImage, tags, author = "Admin", date = "Hoy" }: BlogPreviewProps) {
    return (
      <div className="border-2 border-blue-500 rounded-lg overflow-hidden bg-white shadow-lg">
        <div className="bg-blue-50 px-4 py-2 border-b-2 border-blue-500">
          <p className="text-xs font-semibold text-blue-700">👁️ VISTA PREVIA - TARJETA</p>
        </div>
        <div className="p-4">
          {featuredImage && (
            <img src={featuredImage} alt={title} className="w-full h-48 object-cover rounded-lg mb-4" />
          )}
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
            <span className="font-medium">{author}</span>
            <span>•</span>
            <span>{date}</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{title || "Título del post"}</h3>
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">{excerpt || "Extracto del post..."}</p>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  export function BlogSinglePreview({ title, content, featuredImage, tags, author = "Admin", date = "Hoy" }: BlogPreviewProps) {
    return (
      <div className="border-2 border-green-500 rounded-lg overflow-hidden bg-white shadow-lg">
        <div className="bg-green-50 px-4 py-2 border-b-2 border-green-500">
          <p className="text-xs font-semibold text-green-700">👁️ VISTA PREVIA - PÁGINA COMPLETA</p>
        </div>
        <article className="p-8 max-w-4xl mx-auto">
          {featuredImage && (
            <img src={featuredImage} alt={title} className="w-full h-96 object-cover rounded-xl mb-6" />
          )}
          <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {author.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{author}</p>
              <p className="text-xs">{date}</p>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title || "Título del post"}</h1>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content || "<p>Contenido del post...</p>" }}
          />
        </article>
      </div>
    );
  }