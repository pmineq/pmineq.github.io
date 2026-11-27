import classNames from 'classnames/bind';
import styles from './ShotGrid.module.scss';
import type { Shot } from '@/pages/Home/Home';

const cx = classNames.bind(styles);

type Props = {
  shots: Shot[];
  onRemove: (id: string) => void;
  onSelect?: (shot: Shot) => void;
  capturePulseId?: string | null;
};

const SLOT_COUNT = 4;

const ShotGrid = ({ shots, onRemove, onSelect, capturePulseId }: Props) => {
  return (
    <div className={cx('wrap')}>
      <div className={cx('head')}>
        <div>
          <h2 className={cx('title')}>Story Cut Preview</h2>
          <p className={cx('subtitle')}>찰칵하면 오른쪽 슬롯이 한 칸씩 채워져요.</p>
        </div>
        <span className={cx('count')}>{shots.length}/{SLOT_COUNT}</span>
      </div>

      <div className={cx('storyCard')} aria-label="2x2 Story Cut preview">
        <div className={cx('grid')}>
          {Array.from({ length: SLOT_COUNT }).map((_, index) => {
            const shot = shots[index];

            return (
              <div
                key={shot?.id ?? index}
                className={cx('slot', shot && 'filled', capturePulseId === shot?.id && 'justCaptured')}
                onClick={() => shot && onSelect?.(shot)}
                onKeyDown={(event) => {
                  if (!shot || (event.key !== 'Enter' && event.key !== ' ')) return;
                  event.preventDefault();
                  onSelect?.(shot);
                }}
                role={shot ? 'button' : 'img'}
                tabIndex={shot ? 0 : -1}
                aria-label={`${index + 1}번 컷${shot ? '' : ' 비어 있음'}`}
              >
                {shot ? (
                  <>
                    <img className={cx('img')} src={shot.dataUrl} alt={`${index + 1}번 컷`} />
                    <span className={cx('slotNumber')}>{index + 1}</span>
                    <button
                      type="button"
                      className={cx('removeBtn')}
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemove(shot.id);
                      }}
                      aria-label={`${index + 1}번 컷 삭제`}
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <span className={cx('emptyMark')}>{index + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShotGrid;
