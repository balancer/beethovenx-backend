import { SubgraphMonitorController } from './subgraph-monitor-controller';
import { protocolService } from '../protocol/protocol.service';
import { poolService } from '../pool/pool.service';
import { initRequestScopedContext, setRequestScopedContextValue } from '../context/request-scoped-context';

describe('subgraph monitor controller debugging', () => {
    it('update lag', async () => {
        await SubgraphMonitorController().postSubgraphLagMetrics();
    }, 5000000);
});
