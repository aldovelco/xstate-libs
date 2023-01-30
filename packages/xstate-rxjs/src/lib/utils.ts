import { Interpreter } from 'xstate';

export function getServiceSnapshot<TService extends Interpreter<any, any, any, any>>(
  service: TService
): TService['state'] {
  return service.status !== 0 ? service.getSnapshot() : service.machine.initialState;
}

export function isService(actor: any): actor is Interpreter<any, any, any, any> {
  return 'state' in actor && 'machine' in actor;
}
