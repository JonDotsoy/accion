# ACCION

accion "Another Continuous Integration and Continuous Delivery (CI/CD)"

## Understanding accion

## API

### Manager Jobs

API provide a general control to orchestrate the jobs

### workflow file

Ideas:

- Write a javascript file
- Auto describe the steps to run

Is file to describe all workflow to run scripts. this file look as this:

```typescript
// main.workflow.ts
import { job } from "accion/workflow";

job(
  () => {
    console.log("ok");
    return {
        
    }
  },
);
```
