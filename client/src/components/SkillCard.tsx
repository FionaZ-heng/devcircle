interface Props {
  card: {
    _id: string
    offering: string
    wanting: string
    description: string
    tags: string[]
    userId: { username: string }
  }
}

export default function SkillCard({ card }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs text-gray-400">@{card.userId?.username}</span>
      </div>
      <div className="mb-3">
        <span className="text-xs font-semibold text-green-600 uppercase">Offering</span>
        <p className="font-semibold text-gray-800">{card.offering}</p>
      </div>
      <div className="mb-3">
        <span className="text-xs font-semibold text-blue-600 uppercase">Wanting</span>
        <p className="font-semibold text-gray-800">{card.wanting}</p>
      </div>
      {card.description && <p className="text-gray-500 text-sm mb-3">{card.description}</p>}
      <div className="flex flex-wrap gap-2">
        {card.tags.map((tag, i) => (
          <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{tag}</span>
        ))}
      </div>
    </div>
  )
}