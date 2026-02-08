
interface RoomSelectorProps {
    rooms: string[];
    currentRoom: string;
    onRoomChange: (roomId: string) => void;
}

export default function RoomSelector({ rooms, currentRoom, onRoomChange }: RoomSelectorProps) {
  return (
   <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Select Room
      </h3>
      <div className="flex gap-3">
        {rooms.map((room) => (
          <button
            key={room}
            onClick={() => onRoomChange(room)}
            className={`
              flex-1 py-3 px-6 rounded-xl font-semibold capitalize
              transform hover:scale-105 active:scale-95 transition-all
              focus:outline-none focus:ring-4
              ${currentRoom === room
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg focus:ring-blue-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300"
              }
            `}
          >
            <span className="mr-2">#</span>
            {room}
          </button>
        ))}
      </div>
    </div>
  );
}
