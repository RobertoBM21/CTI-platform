import { ObservedDataService } from '../../../../../../src/contexts/cyber/application/services/observed-data.service';
import {
    ObservedData,
    ObservedDataRepository,
} from '../../../../../../src/contexts/cyber/domain';

describe('ObservedDataService', () => {
    const firstObserved = new Date('2023-09-01T00:00:00Z');
    const lastObserved = new Date('2023-09-30T23:59:59Z');

    it('should delegate findById to observed data repository', async () => {
        const od = new ObservedData({
            id: 'observed-data--od1',
            firstObserved,
            lastObserved,
            numberObserved: 3,
        });
        const repository: Pick<ObservedDataRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(od),
        };

        const service = new ObservedDataService(
            repository as ObservedDataRepository,
        );
        const result = await service.findById('observed-data--od1');

        expect(repository.findById).toHaveBeenCalledWith('observed-data--od1');
        expect(result?.id).toBe('observed-data--od1');
    });

    it('should return null when not found', async () => {
        const repository: Pick<ObservedDataRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(null),
        };

        const service = new ObservedDataService(
            repository as ObservedDataRepository,
        );
        const result = await service.findById('observed-data--missing');

        expect(result).toBeNull();
    });

    it('should delegate save to observed data repository', async () => {
        const od = new ObservedData({
            id: 'observed-data--od2',
            firstObserved,
            lastObserved,
            numberObserved: 10,
        });
        const repository: Pick<ObservedDataRepository, 'save'> = {
            save: jest.fn().mockResolvedValue(od),
        };

        const service = new ObservedDataService(
            repository as ObservedDataRepository,
        );
        const result = await service.save(od);

        expect(repository.save).toHaveBeenCalledWith(od);
        expect(result.id).toBe('observed-data--od2');
    });
});
