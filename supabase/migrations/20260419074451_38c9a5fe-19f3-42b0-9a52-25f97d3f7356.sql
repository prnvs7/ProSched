
-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('manager', 'worker');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own role on signup" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Orders
CREATE TYPE public.order_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE public.order_status AS ENUM ('pending', 'in-progress', 'completed');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  priority order_priority NOT NULL DEFAULT 'medium',
  deadline DATE NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  assigned_machine_id UUID,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Machines
CREATE TYPE public.machine_status AS ENUM ('available', 'busy');

CREATE TABLE public.machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  status machine_status NOT NULL DEFAULT 'available',
  current_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.orders ADD CONSTRAINT orders_assigned_machine_fk FOREIGN KEY (assigned_machine_id) REFERENCES public.machines(id) ON DELETE SET NULL;

-- Workers
CREATE TYPE public.worker_shift AS ENUM ('morning', 'evening', 'night');

CREATE TABLE public.workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name TEXT NOT NULL,
  skill TEXT NOT NULL,
  shift worker_shift NOT NULL DEFAULT 'morning',
  assigned_machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

-- Policies: any authenticated user can read; only managers can write
CREATE POLICY "Authenticated read orders" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers manage orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'manager')) WITH CHECK (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Authenticated read machines" ON public.machines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers manage machines" ON public.machines FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'manager')) WITH CHECK (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Authenticated read workers" ON public.workers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers manage workers" ON public.workers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'manager')) WITH CHECK (public.has_role(auth.uid(), 'manager'));

-- Updated_at trigger for orders
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER orders_touch_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
