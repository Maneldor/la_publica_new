'use client';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
}

export function EmojiPicker({ isOpen, onClose, onSelectEmoji }: EmojiPickerProps) {
  if (!isOpen) return null;

  return (
    <div data-emoji-picker style={{
      position: 'absolute',
      bottom: '100%',
      left: 0,
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      padding: '16px',
      width: '320px',
      maxHeight: '400px',
      marginBottom: '8px',
      zIndex: 100
    }}>
      {/* Header del picker */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#2c3e50',
          margin: 0
        }}>
          Emojis
        </h4>
        <button
          onClick={onClose}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Categorías de emojis */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
        overflowX: 'auto'
      }}>
        {[
          { key: 'recents', icon: '🕐', label: 'Recents' },
          { key: 'people', icon: '😊', label: 'Cares' },
          { key: 'nature', icon: '🌿', label: 'Natura' },
          { key: 'food', icon: '🍔', label: 'Menjar' },
          { key: 'activity', icon: '⚽', label: 'Activitat' },
          { key: 'travel', icon: '✈️', label: 'Viatges' },
          { key: 'objects', icon: '💡', label: 'Objectes' },
          { key: 'symbols', icon: '❤️', label: 'Símbols' }
        ].map((category) => (
          <button
            key={category.key}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              minWidth: '36px'
            }}
            title={category.label}
          >
            {category.icon}
          </button>
        ))}
      </div>

      {/* Grid de emojis */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: '4px',
        maxHeight: '280px',
        overflowY: 'auto'
      }}>
        {[
          // Emojis de caras y personas
          '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
          '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
          '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
          '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
          '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
          '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
          '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
          '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',

          // Gestos y manos
          '👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟',
          '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️',
          '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲',
          '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶',

          // Corazones y símbolos
          '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
          '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
          '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️',
          '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈',

          // Naturaleza
          '🌱', '🌿', '🍀', '🌹', '🌺', '🌻', '🌞', '🌝',
          '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑',
          '🌒', '🌓', '🌔', '⭐', '🌟', '💫', '✨', '☄️',
          '☀️', '🌤️', '⛅', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️',

          // Comida
          '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓',
          '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝',
          '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑',
          '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐',

          // Actividades y deportes
          '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉',
          '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍',
          '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿',
          '🥊', '🥋', '🎽', '🛹', '🛼', '🛴', '⛷️', '🏂',

          // Objetos
          '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵',
          '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️',
          '🪜', '🧰', '🔧', '🔨', '⛏️', '🪚', '🔩', '⚙️',
          '🪤', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️'
        ].map((emoji, index) => (
          <button
            key={index}
            onClick={() => {
              onSelectEmoji(emoji);
              onClose();
            }}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Emojis frecuentes */}
      <div style={{
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #f0f0f0'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#6c757d',
          marginBottom: '8px',
          fontWeight: '500'
        }}>
          Freqüents
        </div>
        <div style={{
          display: 'flex',
          gap: '4px',
          flexWrap: 'wrap'
        }}>
          {['👍', '❤️', '😂', '😊', '👏', '🔥', '💯', '🙏'].map((emoji, index) => (
            <button
              key={index}
              onClick={() => {
                onSelectEmoji(emoji);
                onClose();
              }}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}