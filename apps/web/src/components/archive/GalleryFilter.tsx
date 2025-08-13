interface Props {
    selected: string;
    setSelected: (category: string) => void;
}

const categories = ["All", "Necklaces", "Bracelets", "Watches", "Rings", "Grills"];

export default function GalleryFilter({ selected, setSelected }: Props) {
    return (
        <div className="flex flex-wrap gap-4 justify-center mb-10">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setSelected(cat)}
                    className={`px-4 py-2 border rounded-full transition ${selected === cat ? "bg-white text-black" : "border-white text-white"
                        }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}
